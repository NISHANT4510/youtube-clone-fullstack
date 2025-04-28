export const USERS = [
  {
    id: "user01",
    username: "demo_user",
    email: "demo@example.com",
    password: "demo123", // In real app, this should be hashed
    avatar: "https://placekitten.com/100/100",
    channelId: "channel01"  // User with channel
  },
  {
    id: "user02",
    username: "jane_doe",
    email: "jane@example.com",
    password: "jane123",
    avatar: "https://placekitten.com/101/101",
    channelId: null  // User without channel
  },
  {
    id: "user03",
    username: "new_viewer",
    email: "viewer@example.com",
    password: "viewer123",
    avatar: "https://placekitten.com/102/102"
    // No channelId property = no channel
  },
  {
    id: "user04",
    username: "future_creator",
    email: "creator@example.com",
    password: "create123",
    avatar: "https://placekitten.com/103/103",
    channelId: null  // User without channel
  }
];
