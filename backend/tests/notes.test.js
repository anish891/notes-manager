const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prisma");

afterAll(async () => {
    await prisma.$disconnect();
});


describe("Notes authentication", () => {

    test("should reject request without JWT", async () => {

        const response = await request(app)
            .get("/notes");

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "Authentication required"
        );

    });

    test("should reject invalid JWT", async () => {

        const response = await request(app)
            .get("/notes")
            .set("Authorization", "Bearer invalid-token");

        expect(response.statusCode).toBe(401);

        expect(response.body.success).toBe(false);

        expect(response.body.message).toBe(
            "Invalid or expired token"
        );

    });

    test("should create a note for authenticated user", async () => {

        const email = `note-${Date.now()}@example.com`;
        const password = "password123";

        const registerResponse = await request(app)
            .post("/auth/register")
            .send({
                name: "Note User",
                email,
                password
            });

        expect(registerResponse.statusCode).toBe(201);

        const userId = registerResponse.body.data.id;

        const loginResponse = await request(app)
            .post("/auth/login")
            .send({
                email,
                password
            });

        expect(loginResponse.statusCode).toBe(200);

        const token = loginResponse.body.data.token;

        const noteResponse = await request(app)
            .post("/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Note",
                content: "This note belongs to the authenticated user."
            });

        expect(noteResponse.statusCode).toBe(201);

        expect(noteResponse.body.success).toBe(true);

        expect(noteResponse.body.data).toEqual(
            expect.objectContaining({
                title: "Test Note",
                content: "This note belongs to the authenticated user.",
                userId
            })
        );

    });

    test("should reject client supplied userId", async () => {

    const email = `spoof-${Date.now()}@example.com`;
    const password = "password123";

    const registerResponse = await request(app)
        .post("/auth/register")
        .send({
            name: "Spoof Test User",
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

    const token = loginResponse.body.data.token;

    const noteResponse = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Security Test",
            content: "Testing user ownership",
            userId: 999999
        });

    expect(noteResponse.statusCode).toBe(400);

});

test("should prevent user from accessing another user's note", async () => {

    const password = "password123";

    // Create User A
    const emailA = `user-a-${Date.now()}@example.com`;

    const registerA = await request(app)
        .post("/auth/register")
        .send({
            name: "User A",
            email: emailA,
            password
        });

    expect(registerA.statusCode).toBe(201);

    // Login User A
    const loginA = await request(app)
        .post("/auth/login")
        .send({
            email: emailA,
            password
        });

    expect(loginA.statusCode).toBe(200);

    const tokenA = loginA.body.data.token;

    // User A creates a note
    const noteResponse = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            title: "Private Note",
            content: "This belongs to User A."
        });

    expect(noteResponse.statusCode).toBe(201);

    const noteId = noteResponse.body.data.id;

    // Create User B
    const emailB = `user-b-${Date.now()}@example.com`;

    const registerB = await request(app)
        .post("/auth/register")
        .send({
            name: "User B",
            email: emailB,
            password
        });

    expect(registerB.statusCode).toBe(201);

    // Login User B
    const loginB = await request(app)
        .post("/auth/login")
        .send({
            email: emailB,
            password
        });

    expect(loginB.statusCode).toBe(200);

    const tokenB = loginB.body.data.token;

    // User B tries to access User A's note
    const response = await request(app)
        .get(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Note not found");

});

test("should prevent user from updating another user's note", async () => {

    const password = "password123";

    const emailA = `update-a-${Date.now()}@example.com`;

    const registerA = await request(app)
        .post("/auth/register")
        .send({
            name: "User A",
            email: emailA,
            password
        });

    expect(registerA.statusCode).toBe(201);

    const loginA = await request(app)
        .post("/auth/login")
        .send({
            email: emailA,
            password
        });

    const tokenA = loginA.body.data.token;

    const noteResponse = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            title: "Original Title",
            content: "Original content"
        });

    expect(noteResponse.statusCode).toBe(201);

    const noteId = noteResponse.body.data.id;

    const emailB = `update-b-${Date.now()}@example.com`;

    const registerB = await request(app)
        .post("/auth/register")
        .send({
            name: "User B",
            email: emailB,
            password
        });

    expect(registerB.statusCode).toBe(201);

    const loginB = await request(app)
        .post("/auth/login")
        .send({
            email: emailB,
            password
        });

    const tokenB = loginB.body.data.token;

    const response = await request(app)
        .patch(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
            title: "Hacked Title"
        });

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Note not found");

});

test("should prevent user from deleting another user's note", async () => {

    const password = "password123";

    const emailA = `delete-a-${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "User A",
            email: emailA,
            password
        });

    const loginA = await request(app)
        .post("/auth/login")
        .send({
            email: emailA,
            password
        });

    const tokenA = loginA.body.data.token;

    const noteResponse = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
            title: "Protected Note",
            content: "Should not be deleted by User B"
        });

    expect(noteResponse.statusCode).toBe(201);

    const noteId = noteResponse.body.data.id;

    const emailB = `delete-b-${Date.now()}@example.com`;

    await request(app)
        .post("/auth/register")
        .send({
            name: "User B",
            email: emailB,
            password
        });

    const loginB = await request(app)
        .post("/auth/login")
        .send({
            email: emailB,
            password
        });

    const tokenB = loginB.body.data.token;

    const response = await request(app)
        .delete(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${tokenB}`);

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe("Note not found");

});

test("should allow owner to manage their own note", async () => {

    const email = `owner-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Note Owner",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    expect(loginResponse.statusCode).toBe(200);

    const token = loginResponse.body.data.token;

    // Create
    const createResponse = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Original Title",
            content: "Original content"
        });

    expect(createResponse.statusCode).toBe(201);

    const noteId = createResponse.body.data.id;

    // Get
    const getResponse = await request(app)
        .get(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(getResponse.statusCode).toBe(200);

    expect(getResponse.body.data).toEqual(
        expect.objectContaining({
            id: noteId,
            title: "Original Title",
            content: "Original content"
        })
    );

    // Update
    const updateResponse = await request(app)
        .patch(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Updated Title"
        });

    expect(updateResponse.statusCode).toBe(200);

    expect(updateResponse.body.data.title).toBe("Updated Title");

    // Delete
    const deleteResponse = await request(app)
        .delete(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(204);

    // Verify deleted
    const deletedResponse = await request(app)
        .get(`/notes/${noteId}`)
        .set("Authorization", `Bearer ${token}`);

    expect(deletedResponse.statusCode).toBe(404);

});

test("should reject note with invalid title", async () => {

    const email = `invalid-note-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Test User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Hi",
            content: "Valid content"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

});

test("should reject note without content", async () => {

    const email = `no-content-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Test User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    const response = await request(app)
        .post("/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
            title: "Valid title"
        });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

});

test("should paginate notes", async () => {

    const email = `pagination-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Pagination User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    // Create 3 notes
    for (let i = 1; i <= 3; i++) {

        const response = await request(app)
            .post("/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: `Note ${i}`,
                content: `Content ${i}`
            });

        expect(response.statusCode).toBe(201);
    }

    // Request first page with 2 notes
    const response = await request(app)
        .get("/notes?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data).toHaveLength(2);

    expect(response.body.pagination).toEqual({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2
    });

});

test("should reject invalid page number", async () => {

    const email = `invalid-page-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Pagination User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    const response = await request(app)
        .get("/notes?page=0")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);

});

test("should reject limit greater than 100", async () => {

    const email = `large-limit-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Pagination User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    const response = await request(app)
        .get("/notes?limit=101")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);

});


test("should use default pagination values", async () => {

    const email = `default-pagination-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Pagination User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    const response = await request(app)
        .get("/notes")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    expect(response.body.data).toHaveLength(0);

});

test("should return the correct notes for page 2", async () => {

    const email = `page-two-${Date.now()}@example.com`;
    const password = "password123";

    await request(app)
        .post("/auth/register")
        .send({
            name: "Page Two User",
            email,
            password
        });

    const loginResponse = await request(app)
        .post("/auth/login")
        .send({
            email,
            password
        });

    const token = loginResponse.body.data.token;

    for (let i = 1; i <= 3; i++) {

        const response = await request(app)
            .post("/notes")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: `Note ${i}`,
                content: `Content ${i}`
            });

        expect(response.statusCode).toBe(201);
    }

    const response = await request(app)
        .get("/notes?page=2&limit=2")
        .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.pagination).toEqual({
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2
    });

    expect(response.body.data[0].title).toBe("Note 1");
});

});