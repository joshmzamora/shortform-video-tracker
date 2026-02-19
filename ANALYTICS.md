# Analytics Tracking

This document outlines the analytics tracking implementation for the video scrolling and playback experience.

## Metrics

The following metrics are tracked for each video:

*   **Dwell Time**: The total time a user spends with a video in the primary focus within the viewport. This is calculated in milliseconds.
*   **Retention Rate**: The proportion of the video watched by the user. This is calculated as `(Total Watched Duration / Total Video Length) * 100%`.

## Implementation

The analytics tracking is implemented using the Intersection Observer API. When a video enters the viewport, a timer is started. When the video leaves the viewport, the timer is stopped, and the dwell time and retention rate are calculated and sent to the server.

## Data Schema

The following data schema is used for the analytics data:

```json
{
  "videoId": "string",
  "interactionType": "string",
  "watchTimeMs": "number",
  "dwellTimeMs": "number",
  "retentionRate": "number",
  "participantId": "string",
  "genre": "string",
  "timestamp": "string"
}
```
