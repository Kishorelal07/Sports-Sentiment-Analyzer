package com.sportsanalytics.adapter;

import com.sportsanalytics.model.Sentiment;

import java.util.List;

public interface SentimentAdapter {
    String getAdapterName();
    boolean isEnabled();
    List<Sentiment> fetchSentiment(String matchId, int limit);
    List<Sentiment> fetchPlayerSentiment(String playerId, int limit);
}
