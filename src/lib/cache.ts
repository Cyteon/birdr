import Dexie from "dexie";

interface Me {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  staff: boolean;
  banned: boolean;
  avatarUrl: string;
  verified: boolean;
  otherBadges: string[];
}

const cache = new Dexie("app");

cache.version(1).stores({
  me: "++id, _id, email, username, displayName, staff, banned, avatarUrl, verified, otherBadges",
});

export default cache;
