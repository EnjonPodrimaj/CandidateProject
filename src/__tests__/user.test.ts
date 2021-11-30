import { MongoMemoryServer } from "mongodb-memory-server";
import supertest from "supertest";
import mongoose from "mongoose";
import createServer from "../utils/server";

import { createUser } from "../services/user.service";

import { loginPayload, invalidLoginPayload } from "../test/login-payload";
import {
    johnDoeUserSignupPayload,
    janeDoeUserSignupPayload,
    invalidSignupPayload,
} from "../test/signup-payload";
import {
    validPayload,
    invalidPayload1,
    invalidPayload2,
} from "../test/change-password-payload";

const loginReturnProperties = ["access_token", "refresh_token"];
const signupReturnProperties = [
    "username",
    "full_name",
    "first_name",
    "last_name",
    "email",
    "createdAt",
    "updatedAt",
    "phone",
    "_id",
];

const app = createServer();

describe("user", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();

        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe("signing up", () => {
        describe("given the payload is correct", () => {
            it("should return 200, create the user and return the user essential user data as json", async () => {
                await supertest(app)
                    .post("/signup")
                    .send(johnDoeUserSignupPayload)
                    .set("Accept", "application/json")
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .expect((res: Response) => {
                        let truthy = true;

                        if (res.body && typeof res.body == "object") {
                            const body = res.body;
                            signupReturnProperties.forEach((prop) => {
                                if (!body.hasOwnProperty(prop)) truthy = false;
                            });
                        } else return false;

                        truthy ? true : false;
                    });
            });
        });

        describe("given the payload is incorrect", () => {
            it("should return 400 and missing fields", async () => {
                await supertest(app)
                    .post("/signup")
                    .send(invalidSignupPayload)
                    .set("Accept", "application/json")
                    .expect(400)
                    .expect((res: Response) => {
                        if (
                            res.body &&
                            Array.isArray(res.body) &&
                            res.body.length
                        ) {
                            return true;
                        } else return false;
                    });
            });
        });
    });
});

describe("user", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();

        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe("loging in", () => {
        describe("given the payload is correct", () => {
            it("should return 200, log in and return access & refresh tokens", async () => {
                await createUser(johnDoeUserSignupPayload);

                await supertest(app)
                    .post("/login")
                    .send(loginPayload)
                    .set("Accept", "application/json")
                    .expect(200)
                    .expect("Content-Type", /json/)
                    .expect((res: Response) => {
                        let truthy = true;

                        if (res.body && typeof res.body == "object") {
                            const body = res.body;
                            loginReturnProperties.forEach((prop) => {
                                if (!body.hasOwnProperty(prop)) truthy = false;
                            });
                        } else return false;

                        truthy ? true : false;
                    });
            });
        });

        describe("given the payload is incorrect", () => {
            it("should return 401 and error message indicating that the email or pass are incorrect", async () => {
                await createUser(johnDoeUserSignupPayload);

                await supertest(app)
                    .post("/login")
                    .send(invalidLoginPayload)
                    .set("Accept", "application/json")
                    .expect(401)
                    .expect("Content-Type", /json/)
                    .expect((res: Response) => {
                        const body = res.body;

                        if (
                            body &&
                            typeof body == "object" &&
                            body.hasOwnProperty("error")
                        )
                            return true;
                        else return false;
                    });
            });
        });
    });
});

describe("user operations", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();

        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe("get current user's data", () => {
        describe("given payload is correct", () => {
            it("should return 200 and the currently logged in user information", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode } = await supertest(app)
                    .get("/me")
                    .set("Authorization", `Bearer ${access_token}`);

                expect(statusCode).toBe(200);
            });
        });
    });

    describe("change user's password", () => {
        describe("given the new passwords don't match", () => {
            it("should return 500 and error response", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode, body } = await supertest(app)
                    .post("/me/update-password")
                    .set("Authorization", `Bearer ${access_token}`)
                    .send(invalidPayload2);

                expect(statusCode).toBe(500);
                expect(body).toStrictEqual({
                    error: "New passwords do not match.",
                });
            });
        });

        describe("given the wrong current pass", () => {
            it("should return 500 and error response", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;
                const { statusCode, body } = await supertest(app)
                    .post("/me/update-password")
                    .set("Authorization", `Bearer ${access_token}`)
                    .send(invalidPayload1);

                expect(statusCode).toBe(500);
                expect(body).toStrictEqual({
                    error: "Current password is wrong.",
                });
            });
        });

        describe("given payload is correct", () => {
            it("should return 200 and successful response", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode, body } = await supertest(app)
                    .post("/me/update-password")
                    .set("Authorization", `Bearer ${access_token}`)
                    .send(validPayload);

                expect(statusCode).toBe(200);
                expect(body).toStrictEqual({
                    message: "Password changed successfully.",
                });
            });
        });
    });

    describe("list username & number of likes of a user", () => {
        describe("given payload is correct", () => {
            it("should return 200, username and like count", async () => {
                const { _id } = await createUser(johnDoeUserSignupPayload);
                const { statusCode, body } = await supertest(app).get(
                    `/user/${_id}`
                );

                expect(statusCode).toBe(200);
                expect(body).toStrictEqual({
                    username: "johndoe",
                    likeCount: 0,
                });
            });
        });
    });

    describe("get the most liked user", () => {
        describe("given payload is correct but there is no user registered", () => {
            it("should return 400 and error message", async () => {
                const { statusCode, body } = await supertest(app).get(
                    `/most-liked`
                );

                expect(statusCode).toBe(400);
                expect(body).toStrictEqual({
                    error: "There have been no likes yet!",
                });
            });
        });
    });
});

describe("list and unlike functionality", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();

        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    });

    describe("like user", () => {
        describe("given payload is correct", () => {
            it("should return 200 and successful message", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { _id: janeId } = await createUser(
                    janeDoeUserSignupPayload
                );

                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode, body } = await supertest(app)
                    .get(`/user/${janeId}/like`)
                    .set("Authorization", `Bearer ${access_token}`);

                expect(statusCode).toBe(200);
                expect(body).toStrictEqual({
                    message: "User janedoe liked successfully.",
                });
            });
        });

        describe("given payload is correct - but you are liking a user you already liked", () => {
            it("should return 400 and error message", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { _id: janeId } = await createUser(
                    janeDoeUserSignupPayload
                );

                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode: firstStatusCode, body: firstBody } =
                    await supertest(app)
                        .get(`/user/${janeId}/like`)
                        .set("Authorization", `Bearer ${access_token}`);

                expect(firstStatusCode).toBe(200);
                expect(firstBody).toStrictEqual({
                    message: "User janedoe liked successfully.",
                });

                const { statusCode: secondStatusCode, body: secondBody } =
                    await supertest(app)
                        .get(`/user/${janeId}/like`)
                        .set("Authorization", `Bearer ${access_token}`);

                expect(secondStatusCode).toBe(400);
                expect(secondBody).toStrictEqual({
                    error: "This user is already liked from you.",
                });
            });
        });
    });
    describe("unlike user", () => {
        describe("given payload is correct", () => {
            it("should return 200 and successful message ", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { _id: janeId } = await createUser(
                    janeDoeUserSignupPayload
                );

                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode: firstStatusCode, body: firstBody } =
                    await supertest(app)
                        .get(`/user/${janeId}/like`)
                        .set("Authorization", `Bearer ${access_token}`);

                expect(firstStatusCode).toBe(200);
                expect(firstBody).toStrictEqual({
                    message: "User janedoe liked successfully.",
                });

                const { statusCode: secondStatusCode, body: secondBody } =
                    await supertest(app)
                        .get(`/user/${janeId}/unlike`)
                        .set("Authorization", `Bearer ${access_token}`);

                expect(secondStatusCode).toBe(200);
                expect(secondBody).toStrictEqual({
                    message: "User janedoe unliked successfully.",
                });
            });
        });

        describe("given payload is correct - but the user isn't liked from you", () => {
            it("should return 400 and error message", async () => {
                await createUser(johnDoeUserSignupPayload);
                const { _id: janeId } = await createUser(
                    janeDoeUserSignupPayload
                );

                const { body: loginBody } = await supertest(app)
                    .post("/login")
                    .send(loginPayload);

                const { access_token } = loginBody;

                const { statusCode, body } = await supertest(app)
                    .get(`/user/${janeId}/unlike`)
                    .set("Authorization", `Bearer ${access_token}`);

                expect(statusCode).toBe(400);
                expect(body).toStrictEqual({
                    error: "Can't unlike user janedoe due to this user not being liked from you in the first place.",
                });
            });
        });
    });
});
