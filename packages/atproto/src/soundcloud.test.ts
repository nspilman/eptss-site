import { describe, it, expect } from "vitest";
import { isSoundCloud } from "./soundcloud";

describe("isSoundCloud", () => {
  it("accepts soundcloud.com URLs", () => {
    expect(isSoundCloud("https://soundcloud.com/lyd242/bags")).toBe(true);
  });

  it("accepts www and other subdomains", () => {
    expect(isSoundCloud("https://www.soundcloud.com/foo")).toBe(true);
    expect(isSoundCloud("https://m.soundcloud.com/foo")).toBe(true);
  });

  // Host suffix match, not substring — look-alikes must be rejected.
  it("rejects look-alike hosts", () => {
    expect(isSoundCloud("https://notsoundcloud.com/foo")).toBe(false);
    expect(isSoundCloud("https://soundcloud.com.evil.com/foo")).toBe(false);
  });

  it("rejects other hosts and non-URLs", () => {
    expect(isSoundCloud("https://youtube.com/watch?v=x")).toBe(false);
    expect(isSoundCloud("not a url")).toBe(false);
  });
});
