"use server";

export async function sayHello(defaultName: string, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const name = formData.get("name") || defaultName;
  console.log(`Hello, ${name}`);
}
