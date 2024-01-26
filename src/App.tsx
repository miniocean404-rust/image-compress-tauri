import { PropsWithChildren, ReactNode } from "react";
import DefaultLayout from "./layout/default";

export default function App({ children }: PropsWithChildren<any>): ReactNode {
  return (
    <>
      <DefaultLayout></DefaultLayout>
    </>
  );
}
