import React, { useEffect, useMemo, useState } from 'react';
import { listenToActiveMatches, listenToPlayingMatches } from '../services/matchService';
import { getUsersByIds } from '../services/userService';
import { formatDateTime } from '../services/statsService';

const Landing = () => {
	const [activeMatches, setActiveMatches] = useState([]);
	const [playingMatches, setPlayingMatches] = useState([]);
	const [userMap, setUserMap] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let activeReady = false;
		let playingReady = false;

		const unsubscribeActive = listenToActiveMatches((matches) => {
			setActiveMatches(matches);
			activeReady = true;
			if (activeReady && playingReady) {
				setLoading(false);
			}
		});

		const unsubscribePlaying = listenToPlayingMatches((matches) => {
			setPlayingMatches(matches);
			playingReady = true;
			if (activeReady && playingReady) {
				setLoading(false);
			}
		});

		return () => {
			unsubscribeActive();
			unsubscribePlaying();
		};
	}, []);

	const userIds = useMemo(() => {
		return [...activeMatches, ...playingMatches]
			.flatMap((match) => [match.olusturan_id, match.katilan_id])
			.filter(Boolean);
	}, [activeMatches, playingMatches]);

	useEffect(() => {
		let isActive = true;

		const loadUsers = async () => {
			if (userIds.length === 0) {
				if (isActive) {
					setUserMap({});
				}
				return;
			}

			try {
				const users = await getUsersByIds(userIds);
				if (isActive) {
					setUserMap(users);
				}
			} catch (error) {
				console.error('Landing user map error:', error);
			}
		};

		loadUsers();

		return () => {
			isActive = false;
		};
	}, [userIds]);

	if (loading) {
		return (
			<div className="landing-loading">
				<div className="loading-spinner">Loading matches...</div>
			</div>
		);
	}

	return (
		<div className="landing-wrapper">
			<header className="landing-header">
				<h1>SkillMatch</h1>
				<p>Live matchmaking and active challenges.</p>
			</header>

			<section className="landing-section">
				<h2>Active Matches</h2>
				{activeMatches.length === 0 ? (
					<p>No active matches right now.</p>
				) : (
					<ul>
						{activeMatches.map((match) => (
							<li key={match.id}>
								<strong>{match.oyun_turu || 'Unknown'}</strong> | Entry: ₺{match.giris_ucreti}
								{' | '}Target: {match.hedef || '-'} | Created by:{' '}
								{userMap[match.olusturan_id]?.kullanici_adi || match.olusturan_id}
								{' | '}Created: {formatDateTime(match.olusturulma_tarihi)}
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="landing-section">
				<h2>Live Matches</h2>
				{playingMatches.length === 0 ? (
					<p>No live matches right now.</p>
				) : (
					<ul>
						{playingMatches.map((match) => (
							<li key={match.id}>
								<strong>{match.oyun_turu || 'Unknown'}</strong> | Entry: ₺{match.giris_ucreti}
								{' | '}Created by:{' '}
								{userMap[match.olusturan_id]?.kullanici_adi || match.olusturan_id}
								{' | '}Joined by:{' '}
								{userMap[match.katilan_id]?.kullanici_adi || 'Pending'}
								{' | '}Updated: {formatDateTime(match.guncellenme_tarihi)}
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
};

export default Landing;
