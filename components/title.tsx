
export function Title({ title }: { title: string }) {
    return (
        <h1 className="text-4xl lg:text-5xl font-display font-black tracking-tight text-primary">
            {title}
        </h1>
    )
}