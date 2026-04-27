import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMatchById } from '../services/matchService';
import { getUsersByIds } from '../services/userService';
import { formatDateTime } from '../services/statsService';

const Match = () => {
	const { matchId } = useParams();
	const [match, setMatch] = useState(null);
	const [userMap, setUserMap] = useState({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!matchId) {
			setLoading(false);
			return;
		}

		const loadMatch = async () => {
			setLoading(true);
			try {
				const matchData = await getMatchById(matchId);
				setMatch(matchData);

				if (matchData) {
					const ids = [matchData.olusturan_id, matchData.katilan_id].filter(Boolean);
					const users = await getUsersByIds(ids);
					setUserMap(users);
				}
			} catch (error) {
				console.error('Match load error:', error);
			} finally {
				setLoading(false);
			}
		};

		loadMatch();
	}, [matchId]);

	if (loading) {
		return (
			<div className="match-loading">
				<div className="loading-spinner">Loading match...</div>
			</div>
		);
	}

	if (!match) {
		return (
			<div className="match-empty">
				<h2>Match not found</h2>
				<p>Please check the match ID or try again later.</p>
			</div>
		);
	}

	const creatorName =
		userMap[match.olusturan_id]?.kullanici_adi || match.olusturan_id;
	const participantName = match.katilan_id
		? userMap[match.katilan_id]?.kullanici_adi || match.katilan_id
		: 'Waiting for player';

	return (
		<div className="match-wrapper">
			<header className="match-header">
				<h1>{match.oyun_turu || 'Match'}</h1>
				<p>Status: {match.durum || 'pending'}</p>
			</header>

			<section className="match-section">
				<h2>Players</h2>
				<p>Creator: {creatorName}</p>
				<p>Opponent: {participantName}</p>
			</section>

			<section className="match-section">
				<h2>Details</h2>
				<p>Entry Fee: ₺{match.giris_ucreti}</p>
				<p>Target: {match.hedef || '-'}</p>
				<p>Created: {formatDateTime(match.olusturulma_tarihi)}</p>
				<p>Updated: {formatDateTime(match.guncellenme_tarihi)}</p>
			</section>
		</div>
	);
};

export default Match;
