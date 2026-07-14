type ButtonProps = {
 children: React.ReactNode;
 href: string;
 variant?: "primary" | "secondary";
};

function Button({
 children,
 href,
 variant = "primary",
}: ButtonProps) {
 const baseStyles =
 "inline-block rounded-lg px-8 py-4 text-center font-bold transition";

 const variantStyles =
 variant === "primary"
 ? "bg-red-600 text-white hover:bg-red-700"
 : "border border-white text-white hover:bg-white hover:text-black";

 return (
 <a href={href} className={`${baseStyles} ${variantStyles}`}>
 {children}
 </a>
 );
}

export default Button;