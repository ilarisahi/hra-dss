import * as jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { YogaContext } from "../interfaces";

export const getUser = async (context: YogaContext): Promise<User> => {
    const jwtToken = context.request.signedCookies[process.env.JWT_COOKIE_NAME];
    if (!jwtToken) {
        throw new Error("Unauthorized.");
    }

    const { userId } = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const user = await context.prisma.user.findOne({ where: { id: userId } });
    if (!user) {
        throw new Error("Unauthorized.");
    }

    return user;
};
