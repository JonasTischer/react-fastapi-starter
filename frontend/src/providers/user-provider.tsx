import type { UserRead } from "@/generated/backend-client/types.gen";
import { createContext, useContext, useState } from "react";

interface UserContextType {
	user: UserRead;
	updateUser: (newUser: Partial<UserRead>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
	children,
	initialUser,
}: {
	children: React.ReactNode;
	initialUser: UserRead;
}) {
	const [user, setUser] = useState<UserRead>(initialUser);

	const updateUser = (newUser: Partial<UserRead>) => {
		setUser((prev) => ({ ...prev, ...newUser }));
	};

	return (
		<UserContext.Provider value={{ user, updateUser }}>
			{children}
		</UserContext.Provider>
	);
}

export const useUserContext = () => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUserContext must be used within a UserProvider");
	}
	return context;
};
