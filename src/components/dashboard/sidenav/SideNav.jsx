import React, { useEffect, useState } from 'react'
import NavLinks from './NavLink'
import Logo from '../Logo'
import UserProfile from './UserProfile'
import './SideNav.css'

export default function SideNav() {
	const [collapsed, setCollapsed] = useState(false)
	const [isHovering, setIsHovering] = useState(false)
	const [isMobile, setIsMobile] = useState(false)

	const isExpanded = !collapsed || isHovering || isMobile

	useEffect(() => {
		setIsMobile(window.innerWidth < 768)
		const handleResize = () => {
			const isMobile = window.innerWidth < 768
			setIsMobile(isMobile)
			if (isMobile) setCollapsed(false)
		}
		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<div className="sidenav-wrapper">
			<button
				aria-label="side-bar-toggle"
				className="toggle-button"
				onClick={() => setCollapsed(!collapsed)}
			>
				{collapsed && !isHovering ? '→' : '←'}
			</button>

			<div
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
				className={`sidenav ${isExpanded ? 'expanded' : 'collapsed'}`}
			>
				<div className="logo-container">
					<Logo className="logo" withLabel={isExpanded} />
				</div>

				<div className="sidenav-content">
					<NavLinks collapsed={!isExpanded} />

					<div className="divider" />

					<div className="spacer" />

					<UserProfile collapsed={!isExpanded} />
				</div>
			</div>
		</div>
	)
}
