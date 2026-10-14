import {z} from "zod"; 

export const PASSWORD_MIN = 12; 


export const loginSchema = z.object({

    email: z.email("ikke gyldig e-postadresse"),
    password: z.string().min(PASSWORD_MIN, `passord må ha minst ${PASSWORD_MIN} tegn` )


});

export const usernameSchema = z
    .string()
    .trim()
    .min(3, "brukernavnet må ha minst 3 tegn.")
    .max(20, "brukernavnet kan ikke ha mer en 20 tegn.") // OnlyTwentyCharacters
    .regex(/^[a-z0-9_]+$/, "Du kan kun bruke små bokstaver, tall og understrek i brukernavnet.")

export const registerSchema = z.object({

    name: z.string().trim().min(1, "Skriv inn et fullt navn"),
    username: usernameSchema,
    email: z.email("ikke gyldig e-postadresse"),
    password: z.string().min(PASSWORD_MIN, `passord må ha minst ${PASSWORD_MIN} tegn` )

});

export function firstIssue(error: z.ZodError) {
return error.issues[0] ? error.issues[0].message : "Ugyldig input";

}