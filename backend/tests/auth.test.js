const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

afterAll(async () => {
    await prisma.$disconnect();
});

describe("POST /auth/register", () => {

    test("should register a new user", async () => {

        const email = `test-${Date.now()}@example.com`;

        const response = await request(app)
            .post("/auth/register")
            .send({
                name: "Test User",
                email,
                password: "password123"
            });

        expect(response.statusCode).toBe(201);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toEqual(
            expect.objectContaining({
                name: "Test User",
                email
            })
        );

        expect(response.body.data).not.toHaveProperty("password");

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        expect(user).not.toBeNull();
        expect(user.password).not.toBe("password123");
        expect(user.password).toMatch(/^\$2[aby]\$/);

    });

    test("should reject duplicate email registration", async () => {

    const email = `duplicate-${Date.now()}@example.com`;

    const firstResponse = await request(app)
        .post("/auth/register")
        .send({
            name: "First User",
            email,
            password: "password123"
        });

    expect(firstResponse.statusCode).toBe(201);

    const secondResponse = await request(app)
        .post("/auth/register")
        .send({
            name: "Second User",
            email,
            password: "password456"
        });

    expect(secondResponse.statusCode).toBe(409);

    expect(secondResponse.body.success).toBe(false);

    expect(secondResponse.body.message).toBe(
        "Email already registered"
    );

});

test("should login with valid credentials", async () => {

    const email = `login-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/auth/register")
        .send({
            name: "Login User",
            email,
            password
        });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    expect(loginResponse.statusCode).toBe(200);

    expect(loginResponse.body.success).toBe(true);

    expect(loginResponse.body.data).toHaveProperty("token");

    expect(typeof loginResponse.body.data.token).toBe("string");

    expect(loginResponse.body.data.token.length).toBeGreaterThan(0);

});

test("should reject invalid login credentials", async () => {

    const email = `wrong-password-${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "Test User",
            email,
            password: "password123"
        });

    const response = await request(app)
        .post("/auth/login")
        .send({
            email,
            password: "wrong-password"
        });

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
        "Invalid email or password"
    );

});

test("should reject registration with invalid email", async () => {

    const response = await request(app)
        .post("/auth/register")
        .send({
            name: "Test User",
            email: "not-an-email",
            password: "password123"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

});

test("should reject registration with short password", async () => {

    const response = await request(app)
        .post("/auth/register")
        .send({
            name: "Test User",
            email: `short-${Date.now()}@example.com`,
            password: "1234567"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

});

test("should reject registration without name", async () => {

    const response = await request(app)
        .post("/auth/register")
        .send({
            email: `noname-${Date.now()}@example.com`,
            password: "password123"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

});

});