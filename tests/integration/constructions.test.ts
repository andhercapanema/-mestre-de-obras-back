import app, { close, init } from "@/app";
import { prisma } from "@/config";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createConstruction, createUser } from "../factories";
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

describe("POST /constructions", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/constructions");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/constructions")
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
                .get("/constructions")
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
                .post("/constructions")
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 400 when body is not valid", async () => {
            const token = await generateValidToken();
            const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

            const response = await server
                .post("/constructions")
                .set("Authorization", `Bearer ${token}`)
                .send(invalidBody);

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        describe("when body is valid", () => {
            const generateValidBody = () => ({
                name: faker.name.fullName(),
                address: faker.address.streetAddress(),
                client: faker.name.fullName(),
                technicalManager: faker.name.fullName(),
                initialDate: faker.date.future(),
                endDate: faker.date.future(),
            });

            it("should respond with status 409 when a construction with given name already exists", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const body = generateValidBody();
                const construction = await createConstruction(user.id);

                const response = await server
                    .post("/constructions")
                    .set("Authorization", `Bearer ${token}`)
                    .send({ ...body, name: construction.name });

                expect(response.status).toEqual(httpStatus.CONFLICT);
            });

            it("should respond with status 201 and with construction data", async () => {
                const token = await generateValidToken();
                const body = generateValidBody();

                const response = await server
                    .post("/constructions")
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                const {
                    name,
                    address,
                    client,
                    technicalManager,
                    initialDate,
                    endDate,
                } = body;

                expect(response.status).toEqual(httpStatus.CREATED);
                expect(response.body).toEqual(
                    expect.objectContaining({
                        id: 1,
                        name,
                        address,
                        client,
                        technicalManager,
                        initialDate: initialDate.toISOString(),
                        endDate: endDate.toISOString(),
                    })
                );
            });

            it("should insert a new construction in the database", async () => {
                const token = await generateValidToken();
                const body = generateValidBody();

                const beforeCount = await prisma.construction.count();

                await server
                    .post("/constructions")
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                const afterCount = await prisma.construction.count();

                expect(beforeCount).toEqual(0);
                expect(afterCount).toEqual(1);

                const construction = await prisma.construction.findFirst();
                const {
                    name,
                    address,
                    client,
                    technicalManager,
                    initialDate,
                    endDate,
                } = body;

                expect(construction).toEqual(
                    expect.objectContaining({
                        name,
                        address,
                        client,
                        technicalManager,
                        initialDate,
                        endDate,
                    })
                );
            });
        });
    });
});

describe("GET /constructions", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/constructions");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get("/constructions")
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
                .get("/constructions")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        } else {
            throw enviromentVariableError("JWT_SECRET");
        }
    });

    describe("when token is valid", () => {
        it("should respond with status 200 and with constructions data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const construction = await createConstruction(user.id);
            const { initialDate, endDate, createdAt, updatedAt } = construction;

            const response = await server
                .get("/constructions")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        ...construction,
                        initialDate: initialDate.toISOString(),
                        endDate: endDate.toISOString(),
                        createdAt: createdAt.toISOString(),
                        updatedAt: updatedAt.toISOString(),
                    }),
                ])
            );
        });

        it("should respond with status 200 and not return constructions user does not has access", async () => {
            const user = await createUser();
            const construction = await createConstruction(user.id);
            const { initialDate, endDate, createdAt, updatedAt } = construction;

            const loggedUser = await createUser();
            const loggedUserToken = await generateValidToken(loggedUser);
            await createConstruction(loggedUser.id);

            const response = await server
                .get("/constructions")
                .set("Authorization", `Bearer ${loggedUserToken}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(
                expect.not.arrayContaining([
                    expect.objectContaining({
                        ...construction,
                        initialDate: initialDate.toISOString(),
                        endDate: endDate.toISOString(),
                        createdAt: createdAt.toISOString(),
                        updatedAt: updatedAt.toISOString(),
                    }),
                ])
            );
        });
    });
});

describe("GET /constructions/:id", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get(
            `/constructions/${faker.datatype.number()}`
        );

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .get(`/constructions/${faker.datatype.number()}`)
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
                .get(`/constructions/${faker.datatype.number()}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        } else {
            throw enviromentVariableError("JWT_SECRET");
        }
    });

    describe("when token is valid", () => {
        it("should respond with status 404 if there is no construction with given id", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server
                .get(`/constructions/${faker.datatype.number()}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 401 if construction exists, but logged user does not has access to it", async () => {
            const user = await createUser();
            const construction = await createConstruction(user.id);

            const loggedUser = await createUser();
            const loggedToken = await generateValidToken(loggedUser);

            const response = await server
                .get(`/constructions/${construction.id}`)
                .set("Authorization", `Bearer ${loggedToken}`);

            expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 200 and with construction data", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const construction = await createConstruction(user.id);
            const { initialDate, endDate, createdAt, updatedAt } = construction;

            const response = await server
                .get(`/constructions/${construction.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    ...construction,
                    initialDate: initialDate.toISOString(),
                    endDate: endDate.toISOString(),
                    createdAt: createdAt.toISOString(),
                    updatedAt: updatedAt.toISOString(),
                })
            );
        });
    });
});

describe("PATCH /constructions/:id", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.patch(
            `/constructions/${faker.datatype.number()}`
        );

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .patch(`/constructions/${faker.datatype.number()}`)
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
                .patch(`/constructions/${faker.datatype.number()}`)
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
                .patch(`/constructions/${faker.datatype.number()}`)
                .set("Authorization", `Bearer ${token}`)
                .send({});

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        it("should respond with status 400 when body is not valid", async () => {
            const token = await generateValidToken();
            const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

            const response = await server
                .patch(`/constructions/${faker.datatype.number()}`)
                .set("Authorization", `Bearer ${token}`)
                .send(invalidBody);

            expect(response.status).toEqual(httpStatus.BAD_REQUEST);
        });

        describe("when body is valid", () => {
            const generateValidBody = () => ({
                name: faker.name.fullName(),
                address: faker.address.streetAddress(),
                client: faker.name.fullName(),
                technicalManager: faker.name.fullName(),
                initialDate: faker.date.future(),
                endDate: faker.date.future(),
            });

            it("should respond with status 409 when a construction with given name already exists with another id", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const firstConstruction = await createConstruction(user.id);
                const secondConstruction = await createConstruction(user.id);
                const body = generateValidBody();

                const response = await server
                    .patch(`/constructions/${secondConstruction.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ ...body, name: firstConstruction.name });

                expect(response.status).toEqual(httpStatus.CONFLICT);
            });

            it("should respond with status 404 if there is no construction with given id", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const body = generateValidBody();

                const response = await server
                    .patch(`/constructions/${faker.datatype.number()}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                expect(response.status).toEqual(httpStatus.NOT_FOUND);
            });

            it("should respond with status 401 if construction exists, but logged user does not has access to it", async () => {
                const user = await createUser();
                const construction = await createConstruction(user.id);

                const loggedUser = await createUser();
                const loggedToken = await generateValidToken(loggedUser);
                const body = generateValidBody();

                const response = await server
                    .patch(`/constructions/${construction.id}`)
                    .set("Authorization", `Bearer ${loggedToken}`)
                    .send(body);

                expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
            });

            it("should respond with status 200 and return updated data, when a construction with given name already exists with same id", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const construction = await createConstruction(user.id);
                const body = generateValidBody();

                const response = await server
                    .patch(`/constructions/${construction.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ ...body, name: construction.name });

                expect(response.status).toEqual(httpStatus.OK);
                expect(response.body).toEqual(
                    expect.objectContaining({
                        ...body,
                        name: construction.name,
                        initialDate: body.initialDate.toISOString(),
                        endDate: body.endDate.toISOString(),
                    })
                );
            });

            it("should respond with status 200 and return updated data", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const construction = await createConstruction(user.id);
                const body = generateValidBody();

                const response = await server
                    .patch(`/constructions/${construction.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                expect(response.status).toEqual(httpStatus.OK);
                expect(response.body).toEqual(
                    expect.objectContaining({
                        ...body,
                        initialDate: body.initialDate.toISOString(),
                        endDate: body.endDate.toISOString(),
                    })
                );
            });

            it("should respond with status 200 and update construction data on database", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const construction = await createConstruction(user.id);
                const body = generateValidBody();

                const response = await server
                    .patch(`/constructions/${construction.id}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send(body);

                expect(response.status).toEqual(httpStatus.OK);

                const updatedConstruction =
                    await prisma.construction.findUnique({
                        where: {
                            id: construction.id,
                        },
                    });

                expect(updatedConstruction).toEqual(
                    expect.objectContaining(body)
                );
            });
        });
    });
});

describe("DELETE /constructions/:id", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.delete(
            `/constructions/${faker.datatype.number()}`
        );

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server
            .delete(`/constructions/${faker.datatype.number()}`)
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
                .delete(`/constructions/${faker.datatype.number()}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        } else {
            throw enviromentVariableError("JWT_SECRET");
        }
    });

    describe("when token is valid", () => {
        it("should respond with status 404 if there is no construction with given id", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const response = await server
                .delete(`/constructions/${faker.datatype.number()}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it("should respond with status 401 if construction exists, but logged user does not has access to it", async () => {
            const user = await createUser();
            const construction = await createConstruction(user.id);

            const loggedUser = await createUser();
            const loggedToken = await generateValidToken(loggedUser);

            const response = await server
                .delete(`/constructions/${construction.id}`)
                .set("Authorization", `Bearer ${loggedToken}`);

            expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
        });

        it("should respond with status 200 and delete construction from database", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const construction = await createConstruction(user.id);

            const beforeCount = await prisma.construction.count();

            const response = await server
                .delete(`/constructions/${construction.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toEqual(httpStatus.OK);

            const afterCount = await prisma.construction.count();

            expect(beforeCount).toEqual(1);
            expect(afterCount).toEqual(0);

            const constructionOnDb = await prisma.construction.findUnique({
                where: {
                    id: construction.id,
                },
            });

            expect(constructionOnDb).toBeNull();
        });
    });
});
