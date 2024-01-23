import { PropsWithChildren, ReactNode } from "react";
import Layout from "./layout/default";

export default function App({ children }: PropsWithChildren<any>): ReactNode {
  return (
    <>
      <Layout></Layout>
    </>
  );
}
