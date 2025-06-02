module dao_platform::nft_dao_fundraising {
    use std::error;
    use std::string::{Self, String};
    use std::vector;
    use std::bcs;
    use dao_platform::nft_dao;
    use dao_platform::fundraising;

    /// Error codes
    const EINVALID_OWNER: u64 = 1;
    const EINVALID_AMOUNT: u64 = 2;
    const EINVALID_TIME: u64 = 3;
    const ECAMPAIGN_NOT_STARTED: u64 = 4;
    const ECAMPAIGN_ENDED: u64 = 5;
    const ECAMPAIGN_NOT_ENDED: u64 = 6;
    const ECAMPAIGN_NOT_FOUND: u64 = 7;
    const EDAO_NOT_EXIST: u64 = 8;
    const EVOTING_POWER_NOT_ENOUGH: u64 = 9;
    const EPROPOSAL_NOT_PASSED: u64 = 10;

    /// Create a proposal to approve a fundraising campaign
    public entry fun create_fundraising_proposal(
        account: &signer,
        nft_dao_addr: address,
        campaign_addr: address,
        proposal_name: String,
        proposal_description: String,
        token_names: vector<String>,
        property_versions: vector<u64>,
    ) {
        // Create function arguments for approving the fundraising campaign
        let function_names = vector::singleton(string::utf8(b"approve_fundraising_campaign"));
        
        // Create argument maps
        let arg_names = vector::singleton(vector::singleton(string::utf8(b"campaign_addr")));
        let arg_values = vector::singleton(vector::singleton(bcs::to_bytes(&campaign_addr)));
        let arg_types = vector::singleton(vector::singleton(string::utf8(b"address")));
        
        // Create the proposal
        nft_dao::create_proposal(
            account,
            nft_dao_addr,
            proposal_name,
            proposal_description,
            function_names,
            arg_names,
            arg_values,
            arg_types,
            1, // Minimum voting power
            token_names,
            property_versions,
        );
    }
    
    /// Execute a fundraising campaign approval after proposal passes
    public entry fun execute_fundraising_approval(
        _account: &signer,
        nft_dao_addr: address,
        proposal_id: u64,
        _campaign_addr: address
    ) {
        // Check if the proposal has passed
        let proposal_resolution = nft_dao::get_proposal_resolution(proposal_id, nft_dao_addr);
        assert!(proposal_resolution == 1, error::invalid_state(EPROPOSAL_NOT_PASSED)); // 1 = PROPOSAL_RESOLVED_PASSED
        
        // Emit event for fundraising approval through DAO events system
        // This is a simplified example - in a real implementation, you would transfer initial funds or perform other actions
    }
    
    /// Create a fundraising campaign through the DAO
    public entry fun create_dao_fundraising_campaign(
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
        timelock_duration: u64,
    ) {
        // Create the fundraising campaign
        fundraising::create_campaign(
            account,
            name,
            description,
            target_amount,
            token_price,
            start_time,
            end_time,
            total_supply,
            token_name,
            token_symbol,
            approvers,
            min_approvals,
            timelock_duration,
        );
    }
    
    /// Contribute to a fundraising campaign
    public entry fun contribute_to_campaign(
        contributor: &signer,
        campaign_addr: address,
        amount: u64,
    ) {
        fundraising::contribute(
            contributor,
            campaign_addr,
            amount,
        );
    }
    
    /// Request withdrawal of funds (only owner can call after campaign ends)
    public entry fun request_campaign_withdrawal(
        account: &signer,
        campaign_addr: address,
    ) {
        fundraising::request_withdrawal(
            account,
            campaign_addr,
        );
    }
    
    /// Approve withdrawal (only approvers can call)
    public entry fun approve_campaign_withdrawal(
        approver: &signer,
        campaign_addr: address,
    ) {
        fundraising::approve_withdrawal(
            approver,
            campaign_addr,
        );
    }
    
    /// Execute withdrawal after timelock and sufficient approvals
    public entry fun execute_campaign_withdrawal(
        account: &signer,
        campaign_addr: address,
    ) {
        fundraising::execute_withdrawal(
            account,
            campaign_addr,
        );
    }
    
    /// Request refund if campaign didn't reach its target
    public entry fun request_campaign_refund(
        contributor: &signer,
        campaign_addr: address,
    ) {
        fundraising::request_refund(
            contributor,
            campaign_addr,
        );
    }
    
    #[view]
    /// Returns campaign details including name, description, owner, etc.
    public fun get_campaign_details(campaign_addr: address): (
        String, String, address, u64, u64, u64, u64, u64, u64, u64, bool, bool, u64, u64, u64
    ) {
        fundraising::get_campaign_details(campaign_addr)
    }
    
    #[view]
    /// Returns addresses of all fundraising campaigns
    public fun get_all_campaigns(): vector<address> {
        fundraising::get_all_campaigns()
    }
    
    #[view]
    /// Checks if a campaign exists at the given address
    public fun campaign_exists(campaign_addr: address): bool {
        fundraising::campaign_exists(campaign_addr)
    }
    
    #[view]
    /// Calculates how many tokens a user would receive for a given APT amount
    public fun calculate_tokens(campaign_addr: address, apt_amount: u64): u64 {
        fundraising::calculate_tokens(campaign_addr, apt_amount)
    }
    
    #[view]
    /// Get approvers for a campaign
    public fun get_campaign_approvers(campaign_addr: address): vector<address> {
        fundraising::get_campaign_approvers(campaign_addr)
    }
    
    #[view]
    /// Get current approvals for a campaign
    public fun get_campaign_approvals(campaign_addr: address): vector<address> {
        fundraising::get_campaign_approvals(campaign_addr)
    }
    
    #[view]
    /// Check if a user has contributed to a campaign
    public fun has_contributed(campaign_addr: address, user_addr: address): bool {
        fundraising::has_contributed(campaign_addr, user_addr)
    }
    
    #[view]
    /// Get user contribution details
    public fun get_user_contribution(campaign_addr: address, user_addr: address): (u64, u64, u64, bool) {
        fundraising::get_user_contribution(campaign_addr, user_addr)
    }
}
