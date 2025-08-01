import { convertToSteamID3, extractSteamIdFromUrl } from "../steamAuth";

describe("steamAuth utilities", () => {
  describe("convertToSteamID3", () => {
    it("should convert Steam64 ID to SteamID3 format", () => {
      const steam64 = "76561198000000000";
      const result = convertToSteamID3(steam64);
      expect(result).toBe("39734272");
    });

    it("should handle another Steam64 ID correctly", () => {
      const steam64 = "76561197960265728";
      const result = convertToSteamID3(steam64);
      expect(result).toBe("0");
    });
  });

  describe("extractSteamIdFromUrl", () => {
    it("should extract Steam ID from OpenID callback URL", () => {
      const url =
        "exp://192.168.1.100:8081/--/auth/steam/callback?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.mode=id_res&openid.op_endpoint=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Flogin&openid.claimed_id=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Fid%2F76561198000000000&openid.identity=https%3A%2F%2Fsteamcommunity.com%2Fopenid%2Fid%2F76561198000000000";
      const result = extractSteamIdFromUrl(url);
      expect(result).toBe("76561198000000000");
    });

    it("should return null for URL without Steam ID", () => {
      const url = "exp://192.168.1.100:8081/--/auth/steam/callback?error=invalid";
      const result = extractSteamIdFromUrl(url);
      expect(result).toBeNull();
    });

    it("should return null for malformed URL", () => {
      const url = "not-a-valid-url";
      const result = extractSteamIdFromUrl(url);
      expect(result).toBeNull();
    });
  });
});
