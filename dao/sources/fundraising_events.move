module dao_platform::fundraising_events {
    use std::string::String;
    use aptos_framework::event;
    friend dao_platform::fundraising;

    #[event]
    struct CampaignCreated has drop, store {
        campaign_address: address,
        creator: address,
        name: String,
        description: String,
        target_amount: u64,
        token_price: u64,
        start_time: u64,
        end_time: u64,
        total_supply: u64,
        token_name: String,
        token_symbol: String,
    }

    #[event]
    struct CampaignUpdated has drop, store {
        campaign_address: address,
        updater: address,
        old_target_amount: u64,
        new_target_amount: u64,
        old_end_time: u64,
        new_end_time: u64,
    }

    #[event]
    struct CampaignCancelled has drop, store {
        campaign_address: address,
        canceller: address,
        raised_amount: u64,
        timestamp: u64,
    }

    #[event]
    struct TokensCreated has drop, store {
        campaign_address: address,
        token_name: String,
        token_symbol: String,
        total_supply: u64,
    }

    public(friend) fun emit_campaign_created_event(
        campaign_address: address,
        creator: address,
        name: String,
        description: String,
        target_amount: u64,
        token_price: u64,
        start_time: u64,
        end_time: u64,
        total_supply: u64,
        token_name: String,
        token_symbol: String,
    ) {
        event::emit(CampaignCreated {
            campaign_address,
            creator,
            name,
            description,
            target_amount,
            token_price,
            start_time,
            end_time,
            total_supply,
            token_name,
            token_symbol,
        });
    }

    public(friend) fun emit_campaign_updated_event(
        campaign_address: address,
        updater: address,
        old_target_amount: u64,
        new_target_amount: u64,
        old_end_time: u64,
        new_end_time: u64,
    ) {
        event::emit(CampaignUpdated {
            campaign_address,
            updater,
            old_target_amount,
            new_target_amount,
            old_end_time,
            new_end_time,
        });
    }

    public(friend) fun emit_campaign_cancelled_event(
        campaign_address: address,
        canceller: address,
        raised_amount: u64,
        timestamp: u64,
    ) {
        event::emit(CampaignCancelled {
            campaign_address,
            canceller,
            raised_amount,
            timestamp,
        });
    }

    public(friend) fun emit_tokens_created_event(
        campaign_address: address,
        token_name: String,
        token_symbol: String,
        total_supply: u64,
    ) {
        event::emit(TokensCreated {
            campaign_address,
            token_name,
            token_symbol,
            total_supply,
        });
    }
}
