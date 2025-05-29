import Button from "@mui/material/Button";
import { HiMinusSm } from "react-icons/hi";
import { HiPlus } from "react-icons/hi";

const CartItems = ({
  cartItem,
  removeProduct,
  qty,
  handleQtyMinus,
  handleQtyPlus,
}) => {
  const totalPrice = cartItem.reduce(
    (sum, item) => sum + item.price * (qty[item.id] || 1),
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Your Shopping Cart</h2>
      {cartItem.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItem.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between bg-white p-4 rounded shadow"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 object-contain"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.title.length > 32
                        ? `${item.title.slice(0, 32)}...`
                        : item.title}
                    </h3>
                    <p className="text-gray-700">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-base">
                  <HiMinusSm onClick={() => handleQtyMinus(item.id)} />
                  <p>{qty[item.id]}</p>
                  <HiPlus onClick={() => handleQtyPlus(item.id)} />
                </div>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => removeProduct(item.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {/* Total Section */}
          <div className="mt-6 border-t pt-4 text-right">
            <p className="text-lg font-semibold">
              Total:{" "}
              <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
            </p>
          </div>
          <Button variant="contained" size="large">
            Checkout
          </Button>
        </>
      )}
    </div>
  );
};

export default CartItems;
