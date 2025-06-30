import Image from '/images/NotFound.png'
import ReturnButton from "../../components/button/ReturnButton"
import './404NotFound.css' 

export default function NotFound() {
	return (
		<main className="not-found-page">
			<img
				src="/images/NotFound.png"
				alt="404 Not Found"
				className="not-found-image"
			/>
			<ReturnButton to="/" />
		</main>
	)
}