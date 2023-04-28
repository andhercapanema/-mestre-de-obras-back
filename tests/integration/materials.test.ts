import app, { close, init } from "@/app";
import { prisma } from "@/config";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createMaterial, createUser } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
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

describe("POST /materials", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/materials");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/materials")
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
                .get("/materials")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        } else {
            throw enviromentVariableError("JWT_SECRET");
        }
    });

    describe("when token is valid", () => {
        it("should respond with status 400 when there is no body", async () => {
            const token = await generateValidToken();

            const response = await server
                .post("/materials")
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 400 when body is not valid", async () => {
            const token = await generateValidToken();
            const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

            const response = await server
                .post("/materials")
                .set("Authorization", `Bearer ${token}`)
                .send(invalidBody);

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 409 when body has more than one material with the same name", async () => {
            const token = await generateValidToken();
            const name = faker.name.fullName();
            const duplicatedNameBody = {
                newMaterials: [1, 2].map(() => ({
                    name,
                    unit: faker.word.noun({ strategy: "shortest" }),
                })),
            };

            const response = await server
                .post("/materials")
                .set("Authorization", `Bearer ${token}`)
                .send(duplicatedNameBody);

            expect(response.status).toEqual(httpStatus.CONFLICT);
        });

        describe("when body is valid", () => {
            const generateValidBody = (name?: string) => ({
                newMaterials: [
                    {
                        name: name || faker.name.fullName(),
                        unit: faker.word.noun({ strategy: "shortest" }),
                    },
                ],
            });

            it("should respond with status 409 when a material with given name already exists", async () => {
                const token = await generateValidToken();
                const material = await createMaterial();
                const sameNameBody = generateValidBody(material.name);

                const response = await server
                    .post("/materials")
                    .set("Authorization", `Bearer ${token}`)
                    .send(sameNameBody);

                expect(response.status).toEqual(httpStatus.CONFLICT);
            });

            it("should respond with status 201 and with material data", async () => {
                const token = await generateValidToken();
                const body = generateValidBody();

                const response = await server
                    .post("/materials")
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                expect(response.status).toEqual(httpStatus.CREATED);
                expect(response.body).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 1,
                            name: body.newMaterials[0].name,
                        }),
                    ])
                );
            });

            it("should insert a new material in the database", async () => {
                const token = await generateValidToken();
                const body = generateValidBody();

                const beforeCount = await prisma.material.count();

                await server
                    .post("/materials")
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                const afterCount = await prisma.material.count();

                expect(beforeCount).toEqual(0);
                expect(afterCount).toEqual(1);

                const material = await prisma.material.findFirst();

                expect(material).toEqual(
                    expect.objectContaining({
                        id: 1,
                        name: body.newMaterials[0].name,
                    })
                );
            });
        });
    });
});

describe("GET /materials", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/materials");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/materials")
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
                .get("/materials")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        } else {
            throw enviromentVariableError("JWT_SECRET");
        }
    });

    describe("when token is valid", () => {
        it("should respond with status 200 and with materials data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const material = await createMaterial();

            const response = await server
                .get("/materials")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...material,
                        createdAt: material.createdAt.toISOString(),
                        updatedAt: material.updatedAt.toISOString(),
                    }),
                ])
            );
        });
    });
});
