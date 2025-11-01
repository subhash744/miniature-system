# Leaderboard System in REGEO

## Overview

The leaderboard system in REGEO displays users ranked by their activity and engagement metrics. It provides real-time updates and allows users to discover top performers in the community.

## Ranking Algorithm

### Weighted Scoring System
The leaderboard uses a weighted algorithm to calculate user scores:

```
score = 0.4 * normalized(upvotes) 
      + 0.3 * normalized(views) 
      + 0.2 * normalized(streak) 
      + 0.1 * normalized(project_count)
```

### Normalization Process
1. Filter users by timeframe (today/yesterday/all-time/newcomers)
2. Calculate raw score for each user
3. Find min/max scores in filtered set
4. Normalize: `(score - min) / (max - min)` → [0, 1]
5. Sort by normalized score (highest first)
6. Assign ranks 1, 2, 3, ...

### Timeframes
- **Today**: Users active today
- **Yesterday**: Users active yesterday
- **All-time**: All users in the system
- **Newcomers**: Recently joined users

## Real-time Updates

### Supabase Realtime
The leaderboard uses Supabase Realtime to provide instant updates when:
- Users receive upvotes
- Profile views increase
- Streaks are updated
- New projects are added

### Data Synchronization
- Automatic refresh every 30 seconds
- Manual refresh option
- WebSocket connections for instant updates
- Fallback to polling for reliability

## Leaderboard Features

### Sorting Options
Users can sort the leaderboard by:
- Rank (default)
- Upvotes
- Views
- Streak
- Join date

### Filtering
- Search by username or display name
- Filter by badges
- Filter by activity level
- Filter by project count

### Featured Profiles
- Daily featured profiles section
- Deterministic selection algorithm
- Same profiles shown to all users per day
- Changes at midnight UTC

## Data Storage

### Supabase Tables
- `leaderboard_entries` - Pre-calculated leaderboard data
- `profiles` - User profile data
- `upvotes` - Upvote tracking
- `daily_stats` - Daily activity statistics

### Data Refresh
- Leaderboard entries updated hourly
- Real-time updates for immediate actions
- Batch processing for efficiency
- Caching for performance

## UI Components

### Leaderboard Table
- Responsive design
- Interactive rows
- Badges display
- Quick actions (view profile, upvote)

### Featured Section
- Carousel of featured profiles
- Profile cards with key metrics
- Daily challenge integration

### Search and Filter
- Real-time search
- Advanced filtering options
- Saved filter preferences

## Performance Optimization

### Caching Strategy
- Client-side caching with expiration
- Server-side caching with Redis
- CDN for static assets
- Database indexing for queries

### Pagination
- Infinite scroll implementation
- Virtualized lists for large datasets
- Loading states and placeholders
- Back to top functionality

## API Endpoints

### Leaderboard Data
- `GET /api/leaderboard/:timeframe` - Get leaderboard data
- `GET /api/leaderboard/featured` - Get featured profiles
- `POST /api/leaderboard/refresh` - Force leaderboard refresh

### Real-time Updates
- WebSocket connections for instant updates
- Subscription management
- Error handling and reconnection

## Error Handling

### Common Scenarios
- Network connectivity issues
- Database connection failures
- Rate limiting
- Data consistency issues

### User Experience
- Graceful degradation
- Offline support
- Retry mechanisms
- Clear error messages

## Testing

### Automated Tests
- Unit tests for ranking algorithm
- Integration tests for data flow
- Performance tests for large datasets
- Real-time update tests

### Manual Testing
- Cross-browser compatibility
- Mobile responsiveness
- Edge case scenarios
- User experience validation

## Future Enhancements

### Planned Features
- Custom leaderboard categories
- Team leaderboards
- Regional leaderboards
- Achievement-based rankings
- Social sharing of positions

### Technical Improvements
- Machine learning for ranking
- Advanced analytics
- Better caching strategies
- Enhanced real-time capabilities
- GraphQL API for flexible data access