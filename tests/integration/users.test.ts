import app, { close, init } from "@/app";
import { prisma } from "@/config";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
import { duplicatedEmailError } from "@/services/users-service/errors";
import jwt from "jsonwebtoken";
import { enviromentVariableError } from "@/errors";

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

describe("POST /users", () => {
    it("should respond with status 400 when body is not given", async () => {
        const response = await server.post("/users");

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
        const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

        const response = await server.post("/users").send(invalidBody);

        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    describe("when body is valid", () => {
        const generateValidBody = () => ({
            name: faker.name.fullName(),
            email: faker.internet.email(),
            password: faker.internet.password(6),
        });

        it("should respond with status 409 when there is an user with given email", async () => {
            const body = generateValidBody();
            await createUser(body);

            const response = await server.post("/users").send(body);

            expect(response.status).toBe(httpStatus.CONFLICT);

            if (response.error)
                expect(response.error.text).toEqual(
                    duplicatedEmailError().message
                );
        });

        it("should respond with status 201 and create user when given email is unique", async () => {
            const body = generateValidBody();

            const response = await server.post("/users").send(body);

            expect(response.status).toBe(httpStatus.CREATED);

            const user = await prisma.user.findUnique({
                where: { email: body.email },
            });

            expect(user).toEqual(
                expect.objectContaining({
                    id: 1,
                    name: body.name,
                    email: body.email,
                })
            );
        });
    });
});

describe("GET /users", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/users");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/users")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();

        if (process.env.JWT_SECRET) {
            const token = jwt.sign(
                { userId: userWithoutSession.id },
                process.env.JWT_SECRET
            );

            const response = await server
                .get("/users")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        } else {
            throw enviromentVariableError("JWT_SECRET");
        }
    });

    describe("when token is valid", () => {
        it("should respond with status 200 and with user data", async () => {
            const body = {
                name: faker.name.fullName(),
                email: faker.internet.email(),
                password: faker.internet.password(6),
            };

            const user = await createUser(body);
            const { name, email } = user;
            const token = await generateValidToken(user);

            const response = await server
                .get("/users")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                name,
                email,
            });
        });
    });
});
