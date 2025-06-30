import React from 'react'
import { useNavigate } from 'react-router-dom'
import './ReturnButton.css'

const ReturnButton = ({ to }) => {
	const navigate = useNavigate()

	return (
		<button
			onClick={() => (to ? navigate(to) : navigate(-1))}
			className="return-button"
		>
			Back
		</button>
	)
}

export default ReturnButton
