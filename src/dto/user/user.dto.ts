import Joi from 'joi';

const registerUserDto = Joi.object({
    username: Joi.string().required().min(8),
    password: Joi.string().required().min(8), // Example: enforce minimum length of 8
});

export default registerUserDto;