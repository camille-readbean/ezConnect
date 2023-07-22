import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import NotFoundImage from "./404_Image.jpg";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-10 h-screen">
      <div>
        <h1 className="text-7xl font-bold">404</h1>
        <h4 className="text-2xl mb-2">Page not found</h4>
        <Button variant="contained" onClick={() => navigate("/homepage")}>
          Back Home
        </Button>
      </div>
      <img src={NotFoundImage} alt="Not Found" />
    </div>
  );
}
