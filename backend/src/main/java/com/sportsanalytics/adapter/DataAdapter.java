package com.sportsanalytics.adapter;

import com.sportsanalytics.model.Event;

import java.util.List;

public interface DataAdapter {
    String getAdapterName();
    boolean isEnabled();
    List<Event> fetchEvents(String matchId, int limit);
    void start();
    void stop();
}
