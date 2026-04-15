import { describe, it, expect } from "vitest";
import { mergeTemplates } from "@/api/client";
import type { BackendTemplate } from "@/api/client";
import type { Template } from "@/types/template";

describe("mergeTemplates", () => {
  it("should use local data when backendId matches", () => {
    const backend: BackendTemplate[] = [
      {
        id: "10000000-0001-0001-0001-000000000001",
        name: "Test",
        category: "motivation",
        imageUrl: "data:image/svg+xml;base64,test",
        width: 1080,
        height: 1080,
        textZones: [],
      },
    ];
    const local: Template[] = [
      {
        id: "motivation-sunrise",
        backendId: "10000000-0001-0001-0001-000000000001",
        name: "Восход успеха",
        category: "motivation",
        emoji: "🌅",
        width: 1080,
        height: 1080,
        background: { type: "gradient", value: "linear-gradient(135deg, #667eea, #f093fb)" },
        textZones: [],
      },
    ];

    const result = mergeTemplates(backend, local);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("motivation-sunrise");
    expect(result[0].emoji).toBe("🌅");
  });

  it("should create minimal frontend template for backend-only entries", () => {
    const backend: BackendTemplate[] = [
      {
        id: "20000000-0001-0001-0001-000000000099",
        name: "New Template",
        category: "meme",
        imageUrl: "data:image/svg+xml;base64,test",
        width: 1080,
        height: 1080,
        textZones: [],
      },
    ];

    const result = mergeTemplates(backend, []);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("20000000-0001-0001-0001-000000000099");
    expect(result[0].category).toBe("meme");
    expect(result[0].emoji).toBe("🎨");
  });

  it("should return empty array when both sources are empty", () => {
    expect(mergeTemplates([], [])).toEqual([]);
  });

  it("should convert backend coords (0-100) to frontend coords (0-1) via merge", () => {
    const backend: BackendTemplate[] = [
      {
        id: "test-uuid",
        name: "Test",
        category: "quote",
        imageUrl: "data:image/svg+xml;base64,test",
        width: 1080,
        height: 1080,
        textZones: [
          {
            id: "title",
            x: 50,
            y: 40,
            font_family: "Impact",
            font_size: 48,
            color: "#ffffff",
            default_text: "Hello",
            label: "Title",
            shadow: true,
          },
        ],
      },
    ];

    // Merge with empty local — result uses backendToFrontend path
    const result = mergeTemplates(backend, []);
    expect(result).toHaveLength(1);
    expect(result[0].textZones[0].x).toBe(0.5);
    expect(result[0].textZones[0].y).toBe(0.4);
  });
});
