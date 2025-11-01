import { calculateScore } from '@/lib/storage'

describe('calculateScore', () => {
  it('should calculate score correctly for all-time timeframe', () => {
    const user: any = {
      upvotes: 10,
      views: 100,
      streak: 5,
      projects: [{}, {}, {}] // 3 projects
    }
    
    const score = calculateScore(user, "all-time")
    // Calculation: upvotes * 40 + views * 30 + streak * 20 + projectCount * 10
    // 10 * 40 + 100 * 30 + 5 * 20 + 3 * 10 = 400 + 3000 + 100 + 30 = 3530
    expect(score).toBe(3530)
  })

  it('should calculate score correctly for today timeframe', () => {
    const user: any = {
      upvotes: 10,
      views: 100,
      streak: 5,
      projects: [{}, {}, {}], // 3 projects
      dailyViews: [{ date: new Date().toISOString().split('T')[0], count: 50 }],
      dailyUpvotes: [{ date: new Date().toISOString().split('T')[0], count: 5 }]
    }
    
    const score = calculateScore(user, "today")
    // Calculation: upvotes * 40 + views * 30 + streak * 20 + projectCount * 10
    // 5 * 40 + 50 * 30 + 5 * 20 + 3 * 10 = 200 + 1500 + 100 + 30 = 1830
    expect(score).toBe(1830)
  })

  it('should handle user with no projects', () => {
    const user: any = {
      upvotes: 0,
      views: 0,
      streak: 0,
      projects: []
    }
    
    const score = calculateScore(user, "all-time")
    expect(score).toBe(0)
  })

  it('should handle user with high engagement', () => {
    const user: any = {
      upvotes: 100,
      views: 1000,
      streak: 30,
      projects: Array(10).fill({}) // 10 projects
    }
    
    const score = calculateScore(user, "all-time")
    // Calculation: 100 * 40 + 1000 * 30 + 30 * 20 + 10 * 10 = 4000 + 30000 + 600 + 100 = 34700
    expect(score).toBe(34700)
  })
})