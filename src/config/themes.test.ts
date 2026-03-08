import { describe, it, expect } from "vitest";
import { videoThemes, getTheme } from "./themes";

describe("config/themes", () => {
  it("contains exactly 10 themes", () => {
    expect(videoThemes).toHaveLength(10);
  });

  it("every theme has all required fields populated", () => {
    for (const theme of videoThemes) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.icon).toBeTruthy();
      expect(theme.promptPrefix).toBeTruthy();
      expect(theme.style).toBeTruthy();
    }
  });

  it("getTheme finds a theme by ID", () => {
    const horror = getTheme("horror");
    expect(horror).toBeDefined();
    expect(horror!.name).toBe("Horror");
  });

  it("getTheme returns undefined for unknown ID", () => {
    expect(getTheme("nonexistent")).toBeUndefined();
  });
});
