import Image from "next/image";

export default async function Home() {
  return (
    <div className="min-h-svh flex justify-center items-center w-full overflow-y-auto">
        <div className="relative w-96 h-96">
            <Image fill src="/message_friends.svg" alt="message friends" />
        </div>
    </div>
  );
}
