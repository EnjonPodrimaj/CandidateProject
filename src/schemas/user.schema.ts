import { object, string, number, TypeOf, array } from "zod";

export const CreateUserSchema = object({
    body: object({
        first_name: string({
            required_error: "First Name is required -> fieldName: first_name",
        }),
        last_name: string({
            required_error: "Last Name is required -> fieldName: last_name",
        }),
        username: string({
            required_error: "Username is required -> fieldName: username",
        }),
        password: string({
            required_error:
                "Password is to short. More than 6 charachters please. -> fieldName: password",
        }).min(6),
        passwordConfirmation: string({
            required_error: "Password is required -> fieldName: password",
        }).min(6),
        full_name: string({
            required_error: "Full Name is required -> fieldName: full_name",
        }),
        phone: string({
            required_error:
                "Phone Number is required -> fieldName: phone_number",
        }),
        email: string({
            required_error: "Email is required -> fieldName: email",
        }).email("Not a valid email."),
        liked_from: array(string()),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: "Password do not match",
        path: ["passwordConfirmation"],
    }),
});

export type CreateUserInput = Omit<
    TypeOf<typeof CreateUserSchema>,
    "body.passwordConfirmation"
>;
