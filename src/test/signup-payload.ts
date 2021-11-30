export const johnDoeUserSignupPayload = {
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@gmail.com",
    username: "johndoe",
    phone: "+383 45 111 222",
    password: "johnpass1",
    passwordConfirmation: "johnpass1",
    full_name: "John Doe",
    liked_from: [],
};

export const janeDoeUserSignupPayload = {
    first_name: "Jane",
    last_name: "Doe",
    email: "jane.doe@gmail.com",
    username: "janedoe",
    phone: "+383 45 111 222",
    password: "janepass1",
    passwordConfirmation: "janepass1",
    full_name: "Jane Doe",
    liked_from: [],
};

export const invalidSignupPayload = {
    // first_name: "John", - removed one field to test api
    last_name: "Doe",
    email: "john.doe@gmail.com",
    username: "johndoe",
    phone: "+383 45 111 222",
    password: "johnpass1",
    passwordConfirmation: "johnpass1",
    full_name: "John Doe",
    liked_from: [],
};
