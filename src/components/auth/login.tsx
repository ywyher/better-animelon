"use client"

import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useIsSmall } from "@/hooks/useMediaQuery";
import { PasswordInput } from "@/components/form/password-input";
import { authClient } from "@/lib/auth-client";
import { Dispatch, SetStateAction, useState } from "react";
import { AuthIdentifier, AuthPort } from "@/components/auth/auth";
import LoadingButton from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { identifierSchema, passwordSchema } from "@/types";
import { getEmailByUsername } from "@/components/auth/actions";
import { useQueryClient } from "@tanstack/react-query";

export const loginSchema = z.object({
    identifier: identifierSchema,
    password: z.string().min(1, {
        message: "Password is required.",
    }),
});

type FormValues = z.infer<typeof loginSchema>;

type LoginProps = { 
    setOpen: Dispatch<SetStateAction<boolean>>,
    setPort: Dispatch<SetStateAction<AuthPort>>,
    identifierValue: string
    identifier: AuthIdentifier
}

export default function Login({ setPort, identifier, identifierValue, setOpen }: LoginProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()
    const isSmall = useIsSmall()

    const form = useForm<FormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: identifierValue,
            password: "",
        }
    })

    const onSubmit = async (formData: FormValues) => {
        setIsLoading(true)

        let email: string | null = identifierValue;
        if(identifier == 'username') {
            email = await getEmailByUsername({ username: identifierValue }) || null
        }

        if(!email) {
            toast.error("Failed to get email")
            return
        }

        const result = await authClient.signIn.email({
            email: email,
            password: formData.password,
        });

        if(result.error) {
            toast.error(result.error.message)
            setIsLoading(false)
            return;
        }
        
        queryClient.invalidateQueries({ queryKey: ['session'] })
        setOpen(false)
        setPort('check')
    }

    const onForgetPassword = async () => {
        setIsLoading(true)
        let email: string | null = identifierValue;
        if(identifier == 'username') {
            email = await getEmailByUsername({ username: identifierValue }) || null
        }

        if(!email) {
            toast.error("Failed to get email")
            return
        }

        const { error } = await authClient.forgetPassword({
            email: email,
            redirectTo: "/reset-password",
        });

        if(error) {
            toast.error(error.message)
            setIsLoading(false)
            return;
        }
        
        setIsLoading(false)
        toast.success("Password Reset Link Sent Successfully", {
            description: "May Take 1-5 Minutes",
        });
    }

    const onError = (errors: FieldErrors<FormValues>) => {
        const position = isSmall ? "top-center" : "bottom-right"
        const firstError = Object.values(errors)[0];

        if (firstError?.message) {
          toast.error(firstError.message, { position });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)}>
                <div className="flex flex-col gap-4">
                    <FormField
                        control={form.control}
                        name="identifier"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="capitalize">{identifier}</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <PasswordInput {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <Button
                    variant="link"
                    className="p-0 pt-3"
                    onClick={() => onForgetPassword()}
                    type="button"
                >
                    Forget password ?
                </Button>
                <LoadingButton isLoading={isLoading} className="w-full mt-4">Login</LoadingButton>
            </form>
        </Form>
    )
}