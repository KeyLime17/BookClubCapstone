// Minimal shape for props shared from Laravel/Inertia.
// Extend this later as add more shared props.
export type PageProps = {
  auth?: {
    user?: {
      name: string;
      email?: string;
    } | null;
  };
};
