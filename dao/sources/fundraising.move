module dao_platform::fundraising {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::bcs;
    use aptos_std::table::{Self, Table};
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use dao_platform::nft_dao;

    // Error codes
    const EINVALID_OWNER: u64 = 1;
    const EINVALID_AMOUNT: u64 = 2;
    const EINVALID_TIME: u64 = 3;
    const ECAMPAIGN_NOT_STARTED: u64 = 4;
    const ECAMPAIGN_ENDED: u64 = 5;
    const ECAMPAIGN_NOT_ENDED: u64 = 6;
    const ECAMPAIGN_NOT_FOUND: u64 = 7;
    const ECAMPAIGN_ALREADY_EXISTS: u64 = 8;
    const EINSUFFICIENT_FUNDS: u64 = 9;
    const ETOKEN_ALREADY_CREATED: u64 = 10;
    const ENOT_APPROVER: u64 = 11;
    const EWITHDRAWAL_NOT_REQUESTED: u64 = 12;
    const ETIMELOCK_NOT_EXPIRED: u64 = 13;
    const ENOT_ENOUGH_APPROVALS: u64 = 14;
    const ECAMPAIGN_TARGET_NOT_REACHED: u64 = 15;
    const ECAMPAIGN_TARGET_REACHED: u64 = 16;
    const EALREADY_CONTRIBUTED: u64 = 17;
    const EALREADY_REFUNDED: u64 = 18;
    const EALREADY_APPROVED: u64 = 19;

    // Fundraising campaign structure
    struct FundraisingCampaign has key {
        // Campaign details
        name: String,
        description: String,
        owner: address,
        target_amount: u64,
        token_price: u64, // APT per token (in smallest units)
        start_time: u64,
        end_time: u64,
        total_supply: u64,
        
        // Campaign state
        raised_amount: u64,
        tokens_distributed: u64,
        is_active: bool,
        
        // Metadata for the token
        token_name: String,
        token_symbol: String,
        
        // Multisig and timelock
        approvers: vector<address>,
        min_approvals: u64,
        withdrawal_requested: bool,
        withdrawal_request_time: u64,
        timelock_duration: u64, // in seconds
        approvals: vector<address>,
        
        // Events
        contribution_events: EventHandle<ContributionEvent>,
        withdrawal_events: EventHandle<WithdrawalEvent>,
        refund_events: EventHandle<RefundEvent>,
        approval_events: EventHandle<ApprovalEvent>,
    }

    // Campaign registry to track all campaigns
    struct CampaignRegistry has key {
        campaigns: vector<address>, // Resource account addresses for campaigns
    }
    
    // Wrapper struct for SignerCapability with key ability
    struct CampaignSigner has key {
        cap: account::SignerCapability
    }
    
    // Store contributions for refunds
    struct ContributionStore has key {
        contributions: Table<address, Contribution>,
    }
    
    // Individual contribution record
    struct Contribution has store {
        amount: u64,
        tokens_received: u64,
        timestamp: u64,
        refunded: bool,
    }

    // Events
    struct ContributionEvent has drop, store {
        contributor: address,
        amount: u64,
        tokens_received: u64,
        timestamp: u64,
    }

    struct WithdrawalEvent has drop, store {
        amount: u64,
        timestamp: u64,
    }
    
    struct RefundEvent has drop, store {
        contributor: address,
        amount: u64,
        timestamp: u64,
    }
    
    struct ApprovalEvent has drop, store {
        approver: address,
        campaign_addr: address,
        timestamp: u64,
    }

    // Initialize the module
    fun init_module(account: &signer) {
        move_to(account, CampaignRegistry {
            campaigns: vector::empty<address>(),
        });
    }

    // Create a new fundraising campaign
    public entry fun create_campaign(
        account: &signer,
        name: String,
        description: String,
        target_amount: u64,
        token_price: u64,
        start_time: u64,
        end_time: u64,
        total_supply: u64,
        token_name: String,
        token_symbol: String,
        approvers: vector<address>,
        min_approvals: u64,
        timelock_duration: u64, // in seconds, e.g., 604800 for 7 days
    ) acquires CampaignRegistry {
        let account_addr = signer::address_of(account);
        
        // Validate inputs
        assert!(target_amount > 0, error::invalid_argument(EINVALID_AMOUNT));
        assert!(token_price > 0, error::invalid_argument(EINVALID_AMOUNT));
        assert!(total_supply > 0, error::invalid_argument(EINVALID_AMOUNT));
        assert!(start_time < end_time, error::invalid_argument(EINVALID_TIME));
        assert!(end_time > timestamp::now_seconds(), error::invalid_argument(EINVALID_TIME));
        
        // Validate multisig parameters
        assert!(!vector::is_empty(&approvers), error::invalid_argument(EINVALID_AMOUNT));
        assert!(min_approvals > 0, error::invalid_argument(EINVALID_AMOUNT));
        assert!(min_approvals <= vector::length(&approvers), error::invalid_argument(EINVALID_AMOUNT));
        assert!(timelock_duration > 0, error::invalid_argument(EINVALID_TIME));
        
        // Create a resource account for the campaign
        let seed = bcs::to_bytes(&name);
        vector::append(&mut seed, bcs::to_bytes(&account_addr));
        let (resource_signer, resource_cap) = account::create_resource_account(account, seed);
        let resource_addr = signer::address_of(&resource_signer);
        
        // Store the campaign data
        move_to(&resource_signer, FundraisingCampaign {
            name,
            description,
            owner: account_addr,
            target_amount,
            token_price,
            start_time,
            end_time,
            total_supply,
            raised_amount: 0,
            tokens_distributed: 0,
            is_active: true,
            token_name,
            token_symbol,
            
            // Multisig and timelock
            approvers,
            min_approvals,
            withdrawal_requested: false,
            withdrawal_request_time: 0,
            timelock_duration,
            approvals: vector::empty<address>(),
            
            // Events
            contribution_events: account::new_event_handle(&resource_signer),
            withdrawal_events: account::new_event_handle(&resource_signer),
            refund_events: account::new_event_handle(&resource_signer),
            approval_events: account::new_event_handle(&resource_signer),
        });
        
        // Register the campaign in the registry
        let registry = borrow_global_mut<CampaignRegistry>(@dao_platform);
        vector::push_back(&mut registry.campaigns, resource_addr);
        
        // Store the signer capability in the resource account
        // We need to wrap the SignerCapability in a struct with key ability
        move_to(&resource_signer, CampaignSigner { cap: resource_cap });
        
        // Initialize the contribution store for refunds
        move_to(&resource_signer, ContributionStore {
            contributions: table::new(),
        });
    }

    // Contribute APT to a campaign and receive tokens
    public entry fun contribute(
        contributor: &signer,
        campaign_addr: address,
        amount: u64,
    ) acquires FundraisingCampaign, ContributionStore {
        let contributor_addr = signer::address_of(contributor);
        
        // Verify campaign exists and is active
        assert!(exists<FundraisingCampaign>(campaign_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        let campaign = borrow_global_mut<FundraisingCampaign>(campaign_addr);
        
        // Check campaign status
        let current_time = timestamp::now_seconds();
        assert!(current_time >= campaign.start_time, error::invalid_state(ECAMPAIGN_NOT_STARTED));
        assert!(current_time <= campaign.end_time, error::invalid_state(ECAMPAIGN_ENDED));
        assert!(campaign.is_active, error::invalid_state(ECAMPAIGN_ENDED));
        
        // Get the contribution store
        let contribution_store = borrow_global_mut<ContributionStore>(campaign_addr);
        
        // Check if user has already contributed
        assert!(!table::contains(&contribution_store.contributions, contributor_addr), error::already_exists(EALREADY_CONTRIBUTED));
        
        // Calculate tokens to receive
        let tokens_to_receive = (amount * 100000000) / campaign.token_price; // Convert to smallest units
        
        // Check if there are enough tokens left
        assert!(campaign.tokens_distributed + tokens_to_receive <= campaign.total_supply, 
               error::invalid_argument(EINVALID_AMOUNT));
        
        // Transfer APT from contributor to campaign
        coin::transfer<AptosCoin>(contributor, campaign_addr, amount);
        
        // Update campaign state
        campaign.raised_amount = campaign.raised_amount + amount;
        campaign.tokens_distributed = campaign.tokens_distributed + tokens_to_receive;
        
        // Emit contribution event
        event::emit_event(
            &mut campaign.contribution_events,
            ContributionEvent {
                contributor: contributor_addr,
                amount,
                tokens_received: tokens_to_receive,
                timestamp: current_time,
            },
        );
        
        // Store contribution for potential refund
        table::add(&mut contribution_store.contributions, contributor_addr, Contribution {
            amount,
            tokens_received: tokens_to_receive,
            timestamp: current_time,
            refunded: false,
        });
        
        // Mint and transfer tokens to contributor
        // In a real implementation, this would use the Aptos Token framework
        // For now, we're just tracking the distribution in our state
        // TODO: Implement actual token minting using Aptos Token framework
        // This would require:
        // 1. Creating the token collection on first contribution
        // 2. Minting tokens for each contributor
        // 3. Transferring tokens to the contributor
    }

    // Request withdrawal of funds (only owner can call after campaign ends)
    public entry fun request_withdrawal(
        account: &signer,
        campaign_addr: address,
    ) acquires FundraisingCampaign {
        let account_addr = signer::address_of(account);
        
        // Verify campaign exists
        assert!(exists<FundraisingCampaign>(campaign_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        let campaign = borrow_global_mut<FundraisingCampaign>(campaign_addr);
        
        // Verify caller is the owner
        assert!(account_addr == campaign.owner, error::permission_denied(EINVALID_OWNER));
        
        // Check campaign has ended
        let current_time = timestamp::now_seconds();
        assert!(current_time > campaign.end_time, error::invalid_state(ECAMPAIGN_NOT_ENDED));
        
        // Check if campaign reached its target
        assert!(campaign.raised_amount >= campaign.target_amount, error::invalid_state(ECAMPAIGN_TARGET_NOT_REACHED));
        
        // Check if withdrawal has not been requested yet
        assert!(!campaign.withdrawal_requested, error::invalid_state(EWITHDRAWAL_NOT_REQUESTED));
        
        // Set withdrawal request time
        campaign.withdrawal_requested = true;
        campaign.withdrawal_request_time = current_time;
        
        // Reset approvals
        campaign.approvals = vector::empty<address>();
    }
    
    // Approve withdrawal (only approvers can call)
    public entry fun approve_withdrawal(
        approver: &signer,
        campaign_addr: address,
    ) acquires FundraisingCampaign {
        let approver_addr = signer::address_of(approver);
        
        // Verify campaign exists
        assert!(exists<FundraisingCampaign>(campaign_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        let campaign = borrow_global_mut<FundraisingCampaign>(campaign_addr);
        
        // Verify caller is an approver
        assert!(vector::contains(&campaign.approvers, &approver_addr), error::permission_denied(ENOT_APPROVER));
        
        // Check if withdrawal has been requested
        assert!(campaign.withdrawal_requested, error::invalid_state(EWITHDRAWAL_NOT_REQUESTED));
        
        // Check if approver has not already approved
        assert!(!vector::contains(&campaign.approvals, &approver_addr), error::invalid_state(EALREADY_APPROVED));
        
        // Add approval
        vector::push_back(&mut campaign.approvals, approver_addr);
        
        // Emit approval event
        let current_time = timestamp::now_seconds();
        event::emit_event(
            &mut campaign.approval_events,
            ApprovalEvent {
                approver: approver_addr,
                campaign_addr,
                timestamp: current_time,
            },
        );
    }
    
    // Execute withdrawal after timelock and sufficient approvals
    public entry fun execute_withdrawal(
        account: &signer,
        campaign_addr: address,
    ) acquires FundraisingCampaign, CampaignSigner {
        let account_addr = signer::address_of(account);
        
        // Verify campaign exists
        assert!(exists<FundraisingCampaign>(campaign_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        let campaign = borrow_global_mut<FundraisingCampaign>(campaign_addr);
        
        // Verify caller is the owner
        assert!(account_addr == campaign.owner, error::permission_denied(EINVALID_OWNER));
        
        // Check if withdrawal has been requested
        assert!(campaign.withdrawal_requested, error::invalid_state(EWITHDRAWAL_NOT_REQUESTED));
        
        // Check timelock duration has passed
        let current_time = timestamp::now_seconds();
        assert!(current_time >= campaign.withdrawal_request_time + campaign.timelock_duration, 
               error::invalid_state(ETIMELOCK_NOT_EXPIRED));
        
        // Check if there are enough approvals
        assert!(vector::length(&campaign.approvals) >= campaign.min_approvals, 
               error::invalid_state(ENOT_ENOUGH_APPROVALS));
        
        // Get the amount to withdraw
        let amount = campaign.raised_amount;
        assert!(amount > 0, error::invalid_argument(EINVALID_AMOUNT));
        
        // Reset raised amount to prevent double withdrawal
        campaign.raised_amount = 0;
        campaign.is_active = false;
        campaign.withdrawal_requested = false;
        
        // Create a signer from the resource account's signer capability
        let campaign_signer_data = borrow_global<CampaignSigner>(campaign_addr);
        let campaign_signer = account::create_signer_with_capability(&campaign_signer_data.cap);
        coin::transfer<AptosCoin>(&campaign_signer, account_addr, amount);
        
        // Emit withdrawal event
        event::emit_event(
            &mut campaign.withdrawal_events,
            WithdrawalEvent {
                amount,
                timestamp: current_time,
            },
        );
    }
    
    // Request refund if campaign didn't reach its target
    public entry fun request_refund(
        contributor: &signer,
        campaign_addr: address,
    ) acquires FundraisingCampaign, ContributionStore, CampaignSigner {
        let contributor_addr = signer::address_of(contributor);
        
        // Verify campaign exists
        assert!(exists<FundraisingCampaign>(campaign_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        let campaign = borrow_global_mut<FundraisingCampaign>(campaign_addr);
        
        // Check campaign has ended
        let current_time = timestamp::now_seconds();
        assert!(current_time > campaign.end_time, error::invalid_state(ECAMPAIGN_NOT_ENDED));
        
        // Check if campaign didn't reach its target
        assert!(campaign.raised_amount < campaign.target_amount, error::invalid_state(ECAMPAIGN_TARGET_REACHED));
        
        // Get the contribution store
        let contribution_store = borrow_global_mut<ContributionStore>(campaign_addr);
        
        // Check if user has contributed
        assert!(table::contains(&contribution_store.contributions, contributor_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        
        // Get the contribution
        let contribution = table::borrow_mut(&mut contribution_store.contributions, contributor_addr);
        
        // Check if not already refunded
        assert!(!contribution.refunded, error::invalid_state(EALREADY_REFUNDED));
        
        // Get refund amount
        let refund_amount = contribution.amount;
        
        // Mark as refunded
        contribution.refunded = true;
        
        // Create a signer from the resource account's signer capability
        let campaign_signer_data = borrow_global<CampaignSigner>(campaign_addr);
        let campaign_signer = account::create_signer_with_capability(&campaign_signer_data.cap);
        
        // Transfer APT back to contributor
        coin::transfer<AptosCoin>(&campaign_signer, contributor_addr, refund_amount);
        
        // Update campaign state
        campaign.raised_amount = campaign.raised_amount - refund_amount;
        campaign.tokens_distributed = campaign.tokens_distributed - contribution.tokens_received;
        
        // Emit refund event
        event::emit_event(
            &mut campaign.refund_events,
            RefundEvent {
                contributor: contributor_addr,
                amount: refund_amount,
                timestamp: current_time,
            },
        );
    }

    // Get campaign details
    #[view]
    public fun get_campaign_details(campaign_addr: address): (
        String, String, address, u64, u64, u64, u64, u64, u64, u64, bool, bool, u64, u64, u64
    ) acquires FundraisingCampaign {
        let campaign = borrow_global<FundraisingCampaign>(campaign_addr);
        (
            campaign.name,
            campaign.description,
            campaign.owner,
            campaign.target_amount,
            campaign.token_price,
            campaign.start_time,
            campaign.end_time,
            campaign.total_supply,
            campaign.raised_amount,
            campaign.tokens_distributed,
            campaign.is_active,
            campaign.withdrawal_requested,
            campaign.withdrawal_request_time,
            campaign.timelock_duration,
            campaign.min_approvals
        )
    }

    // Get all campaigns
    #[view]
    public fun get_all_campaigns(): vector<address> acquires CampaignRegistry {
        let registry = borrow_global<CampaignRegistry>(@dao_platform);
        *&registry.campaigns
    }

    // Check if a campaign exists
    #[view]
    public fun campaign_exists(campaign_addr: address): bool {
        exists<FundraisingCampaign>(campaign_addr)
    }

    // Calculate tokens for a given APT amount
    #[view]
    public fun calculate_tokens(campaign_addr: address, apt_amount: u64): u64 acquires FundraisingCampaign {
        let campaign = borrow_global<FundraisingCampaign>(campaign_addr);
        (apt_amount * 100000000) / campaign.token_price
    }
    
    // Get approvers for a campaign
    #[view]
    public fun get_campaign_approvers(campaign_addr: address): vector<address> acquires FundraisingCampaign {
        let campaign = borrow_global<FundraisingCampaign>(campaign_addr);
        campaign.approvers
    }
    
    // Get current approvals for a campaign
    #[view]
    public fun get_campaign_approvals(campaign_addr: address): vector<address> acquires FundraisingCampaign {
        let campaign = borrow_global<FundraisingCampaign>(campaign_addr);
        campaign.approvals
    }
    
    // Check if a user has contributed to a campaign
    #[view]
    public fun has_contributed(campaign_addr: address, user_addr: address): bool acquires ContributionStore {
        if (!exists<ContributionStore>(campaign_addr)) {
            return false
        };
        let contribution_store = borrow_global<ContributionStore>(campaign_addr);
        table::contains(&contribution_store.contributions, user_addr)
    }
    
    // Get user contribution details
    #[view]
    public fun get_user_contribution(campaign_addr: address, user_addr: address): (u64, u64, u64, bool) acquires ContributionStore {
        let contribution_store = borrow_global<ContributionStore>(campaign_addr);
        assert!(table::contains(&contribution_store.contributions, user_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        
        let contribution = table::borrow(&contribution_store.contributions, user_addr);
        (
            contribution.amount,
            contribution.tokens_received,
            contribution.timestamp,
            contribution.refunded
        )
    }

    // Integration with DAO module
    public fun create_dao_proposal_for_campaign(
        account: &signer,
        nft_dao_addr: address,
        campaign_addr: address,
        proposal_name: String,
        proposal_description: String,
        token_names: vector<String>,
        property_versions: vector<u64>,
    ) {
        // Verify campaign exists
        assert!(exists<FundraisingCampaign>(campaign_addr), error::not_found(ECAMPAIGN_NOT_FOUND));
        // We only need to check if campaign exists, no need to borrow it
        
        // Create a proposal in the DAO to approve the fundraising campaign
        // This is a simplified version - you would need to adapt this to your actual DAO interface
        nft_dao::create_proposal(
            account,
            nft_dao_addr,
            proposal_name,
            proposal_description,
            vector::singleton(string::utf8(b"approve_fundraising")),
            vector::singleton(vector::singleton(string::utf8(b"campaign_addr"))),
            vector::singleton(vector::singleton(bcs::to_bytes(&campaign_addr))),
            vector::singleton(vector::singleton(string::utf8(b"address"))),
            1, // Minimum voting power
            token_names,
            property_versions,
        );
    }

    // Test functions
    #[test_only]
    public fun setup_test(aptos_framework: &signer, account: &signer) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        account::create_account_for_test(signer::address_of(account));
        init_module(account);
    }

    #[test(aptos_framework = @0x1, account = @dao_platform)]
    public fun test_create_campaign(aptos_framework: &signer, account: &signer) acquires CampaignRegistry {
        setup_test(aptos_framework, account);
        
        // Create empty vector for approvers and add account address as the only approver
        let approvers = vector::empty<address>();
        vector::push_back(&mut approvers, signer::address_of(account));
        
        create_campaign(
            account,
            string::utf8(b"Test Campaign"),
            string::utf8(b"A test fundraising campaign"),
            1000000000, // 10 APT
            50000000,   // 0.5 APT per token
            timestamp::now_seconds(),
            timestamp::now_seconds() + 86400, // 1 day
            10000,      // 10,000 tokens
            string::utf8(b"TestToken"),
            string::utf8(b"TT"),
            approvers,  // List of approvers for multisig
            1,          // Minimum approvals required
            86400       // Timelock duration (1 day)
        );
        
        let campaigns = get_all_campaigns();
        assert!(vector::length(&campaigns) == 1, 0);
    }
}
