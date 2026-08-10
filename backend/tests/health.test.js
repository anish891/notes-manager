const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {

    test("should return health status", async () => {

        const response = await request(app)
            .get("/health");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("OK");

    });

});