export const PageTitle = ({ title }: { title: string }) => {
  return (
    <>
      <h1 className="text-2xl font-bold">{title}</h1>
      <hr className="my-4" />
    </>
  );
};
