import ProductList from "@/components/product_list";
import ProductForm from "@/components/product_form";
export default function Home() {
  return (
    <div>
      <ProductForm />

      <h1>Product List</h1>
      <ProductList />
    </div>
  );
}
