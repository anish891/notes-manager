const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {

    test("should return health status", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("OK");

    });

    test("should include security headers", async () => {

    const response = await request(app)
        .get("/health");

    expect(response.statusCode).toBe(200);

    expect(response.headers["x-content-type-options"])
        .toBe("nosniff");

    expect(response.headers["x-frame-options"])
        .toBe("SAMEORIGIN");

    expect(response.headers["referrer-policy"])
        .toBe("no-referrer");

    expect(response.headers["content-security-policy"])
        .toBeDefined();

});

});