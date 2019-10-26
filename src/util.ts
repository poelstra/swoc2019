export async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function never(): Promise<never> {
    return new Promise(() => {});
}
