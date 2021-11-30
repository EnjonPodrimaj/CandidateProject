export const validPayload = {
    oldToBePassword: "johnpass1",
    newPassword: "johnpass2",
    newPasswordConfirmation: "johnpass2",
};

export const invalidPayload1 = {
    oldToBePassword: "johnpassOne",
    newPassword: "johnpass2",
    newPasswordConfirmation: "johnpass2",
};

export const invalidPayload2 = {
    oldToBePassword: "johnpass1",
    newPassword: "johnpass2",
    newPasswordConfirmation: "johnpass3",
};