import app, { close, init } from "@/app";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createUser } from "../factories";
import { cleanDb } from "../helpers";
import { prisma } from "@/config";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

afterAll(async () => {
    await close();
});

const server = supertest(app);

describe("POST /auth/login", () => {
    it("should respond with status 400 when body is not given", async () => {
        const response = await server.post("/auth/login");

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
        const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

        const response = await server.post("/auth/login").send(invalidBody);

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
        const generateValidBody = () => ({
            email: faker.internet.email(),
            password: faker.internet.password(6),
        });

        it("should respond with status 401 if there is no user for given email", async () => {
            const body = generateValidBody();

            const response = await server.post("/auth/login").send(body);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 401 if there is a user for given email but password is not correct", async () => {
            const body = generateValidBody();
            await createUser(body);

            const response = await server.post("/auth/login").send({
                ...body,
                password: faker.internet.password(6),
            });

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        describe("when credentials are valid", () => {
            it("should respond with status 200", async () => {
                const body = generateValidBody();
                await createUser(body);

                const response = await server.post("/auth/login").send(body);

                expect(response.status).toBe(httpStatus.OK);
            });

            it("should respond with user data", async () => {
                const body = generateValidBody();
                const { id, email } = await createUser(body);

                const response = await server.post("/auth/login").send(body);

                expect(response.body.user).toEqual({
                    id,
                    email,
                });
            });

            it("should respond with session token", async () => {
                const body = generateValidBody();
                await createUser(body);

                const response = await server.post("/auth/login").send(body);

                const session = await prisma.session.findFirst();

                expect(response.body.token).toBe(session?.token);
            });
        });
    });
});
