import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMatchById, updateMatchStatus, completeMatch } from '../services/matchService';
import { getUsersByIds } from '../services/userService';
import { formatDateTime } from '../services/statsService';
import { getCompletePlayerProfile } from '../services/lolService';
import './Match.css';

const Match = () => {
	const { matchId } = useParams();
	const navigate = useNavigate();
	const { user: currentUser } = useAuth();

	// Match Data
	const [match, setMatch] = useState(null);
	const [userMap, setUserMap] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// LoL Data
	const [creatorProfile, setCreatorProfile] = useState(null);
	const [participantProfile, setParticipantProfile] = useState(null);
	const [lolLoading, setLolLoading] = useState(false);
	const [lolError, setLolError] = useState(null);

	// Match Actions
	const [winner, setWinner] = useState(null);
	const [actionLoading, setActionLoading] = useState(false);
	const [actionError, setActionError] = useState(null);
	const [successMessage, setSuccessMessage] = useState(null);

	// Load Match Data
	useEffect(() => {
		if (!matchId) {
			setLoading(false);
			return;
		}

		const loadMatch = async () => {
			setLoading(true);
			setError(null);
			try {
				const matchData = await getMatchById(matchId);
				setMatch(matchData);

				if (matchData) {
					const ids = [matchData.olusturan_id, matchData.katilan_id].filter(Boolean);
					const users = await getUsersByIds(ids);
					setUserMap(users);
				}
			} catch (err) {
				console.error('Match load error:', err);
				setError('Failed to load match');
			} finally {
				setLoading(false);
			}
		};

		loadMatch();
	}, [matchId]);

	// Load LoL Profiles
	useEffect(() => {
		const loadProfiles = async () => {
			if (!match || !userMap) return;

			setLolLoading(true);
			setLolError(null);

			try {
				// Get creator summoner name from Discord/username
				const creatorUser = userMap[match.olusturan_id];
				const participantUser = userMap[match.katilan_id];

				if (creatorUser?.riot_summoner_name) {
					const profile = await getCompletePlayerProfile(creatorUser.riot_summoner_name);
					setCreatorProfile(profile);
				}

				if (participantUser?.riot_summoner_name) {
					const profile = await getCompletePlayerProfile(participantUser.riot_summoner_name);
					setParticipantProfile(profile);
				}
			} catch (err) {
				console.error('LoL profile load error:', err);
				setLolError(err.message);
			} finally {
				setLolLoading(false);
			}
		};

		loadProfiles();
	}, [match, userMap]);

	// Start Match Handler
	const handleStartMatch = async () => {
		setActionLoading(true);
		setActionError(null);
		try {
			await updateMatchStatus(matchId, 'oynanıyor');
			setMatch(prev => ({ ...prev, durum: 'oynanıyor' }));
			setSuccessMessage('✓ Match started!');
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setActionError(err.message);
		} finally {
			setActionLoading(false);
		}
	};

	// Complete Match Handler
	const handleCompleteMatch = async () => {
		if (!winner) {
			setActionError('Please select a winner');
			return;
		}

		setActionLoading(true);
		setActionError(null);
		try {
			const winnerUserId = winner === 'creator' ? match.olusturan_id : match.katilan_id;
			await completeMatch(
				matchId,
				winnerUserId,
				match.olusturan_id,
				match.katilan_id,
				match.giris_ucreti
			);
			setMatch(prev => ({ ...prev, durum: 'tamamlandı' }));
			setSuccessMessage('✓ Match completed! Rewards distributed.');
			setTimeout(() => navigate('/dashboard'), 3000);
		} catch (err) {
			setActionError(err.message);
		} finally {
			setActionLoading(false);
		}
	};

	const isCreator = currentUser?.uid === match?.olusturan_id;
	const creatorName = userMap[match?.olusturan_id]?.kullanici_adi || 'Unknown';
	const participantName = match?.katilan_id
		? userMap[match.katilan_id]?.kullanici_adi || 'Unknown'
		: 'Waiting for player';

	// Render States
	if (loading) {
		return (
			<div className="match-container">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading match...</p>
				</div>
			</div>
		);
	}

	if (!match) {
		return (
			<div className="match-container">
				<div className="error-state">
					<h2>Match Not Found</h2>
					<p>The match you're looking for doesn't exist.</p>
					<button onClick={() => navigate('/lobby')} className="btn-primary">
						Back to Lobby
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="match-container">
			{/* Header */}
			<div className="match-header">
				<div className="header-content">
					<h1>{match.oyun_turu || 'League of Legends'}</h1>
					<div className="status-badge" data-status={match.durum}>
						{match.durum === 'oynanıyor' && '🎮 Playing'}
						{match.durum === 'beklemede' && '⏳ Waiting'}
						{match.durum === 'tamamlandı' && '✓ Completed'}
						{!['oynanıyor', 'beklemede', 'tamamlandı'].includes(match.durum) && match.durum}
					</div>
				</div>
				<div className="match-fee">
					<span className="fee-label">Entry Fee</span>
					<span className="fee-amount">₺{match.giris_ucreti}</span>
				</div>
			</div>

			{/* Messages */}
			{error && <div className="alert alert-error">{error}</div>}
			{actionError && <div className="alert alert-error">{actionError}</div>}
			{successMessage && <div className="alert alert-success">{successMessage}</div>}
			{lolError && <div className="alert alert-warning">Could not load LoL profile: {lolError}</div>}

			{/* Main Content */}
			<div className="match-content">
				{/* Players Section */}
				<section className="players-section">
					<h2>Players</h2>

					<div className="players-grid">
						{/* Creator */}
						<div className="player-card">
							<div className="player-header">
								<h3>{creatorName}</h3>
								{isCreator && <span className="badge badge-owner">You (Creator)</span>}
							</div>

							{lolLoading ? (
								<div className="profile-loading">Loading profile...</div>
							) : creatorProfile ? (
								<div className="lol-profile">
									<div className="summoner-info">
										<div className="summoner-name">
											{creatorProfile.summoner.name}
										</div>
										<div className="summoner-level">
											Level {creatorProfile.summoner.summonerLevel}
										</div>
									</div>

									{creatorProfile.rank && (
										<div className="rank-info">
											<div className="rank-tier">
												{creatorProfile.rank.tier}
											</div>
											<div className="rank-lp">
												{creatorProfile.rank.rank} - {creatorProfile.rank.leaguePoints} LP
											</div>
											<div className="rank-record">
												{creatorProfile.rank.wins}W - {creatorProfile.rank.losses}L
											</div>
										</div>
									)}

									{creatorProfile.topChampions && creatorProfile.topChampions.length > 0 && (
										<div className="top-champions">
											<p className="label">Top Champions:</p>
											<div className="champion-list">
												{creatorProfile.topChampions.slice(0, 3).map((champ, idx) => (
													<div key={idx} className="champion-item">
														<span className="champ-id">#{champ.championId}</span>
														<span className="champ-mastery">
															Level {champ.championLevel}
														</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="profile-empty">
									<p>LoL profile not connected</p>
								</div>
							)}
						</div>

						{/* VS Badge */}
						<div className="vs-badge">VS</div>

						{/* Participant */}
						<div className="player-card">
							<div className="player-header">
								<h3>{participantName}</h3>
								{match.katilan_id && !isCreator && <span className="badge badge-opponent">Opponent</span>}
								{!match.katilan_id && <span className="badge badge-waiting">Waiting to join</span>}
							</div>

							{!match.katilan_id ? (
								<div className="profile-empty">
									<p>Waiting for opponent...</p>
								</div>
							) : lolLoading ? (
								<div className="profile-loading">Loading profile...</div>
							) : participantProfile ? (
								<div className="lol-profile">
									<div className="summoner-info">
										<div className="summoner-name">
											{participantProfile.summoner.name}
										</div>
										<div className="summoner-level">
											Level {participantProfile.summoner.summonerLevel}
										</div>
									</div>

									{participantProfile.rank && (
										<div className="rank-info">
											<div className="rank-tier">
												{participantProfile.rank.tier}
											</div>
											<div className="rank-lp">
												{participantProfile.rank.rank} - {participantProfile.rank.leaguePoints} LP
											</div>
											<div className="rank-record">
												{participantProfile.rank.wins}W - {participantProfile.rank.losses}L
											</div>
										</div>
									)}

									{participantProfile.topChampions && participantProfile.topChampions.length > 0 && (
										<div className="top-champions">
											<p className="label">Top Champions:</p>
											<div className="champion-list">
												{participantProfile.topChampions.slice(0, 3).map((champ, idx) => (
													<div key={idx} className="champion-item">
														<span className="champ-id">#{champ.championId}</span>
														<span className="champ-mastery">
															Level {champ.championLevel}
														</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="profile-empty">
									<p>LoL profile not connected</p>
								</div>
							)}
						</div>
					</div>
				</section>

				{/* Match Details Section */}
				<section className="details-section">
					<h2>Match Details</h2>
					<div className="details-grid">
						<div className="detail-item">
							<span className="label">Created</span>
							<span className="value">{formatDateTime(match.olusturulma_tarihi)}</span>
						</div>
						<div className="detail-item">
							<span className="label">Updated</span>
							<span className="value">{formatDateTime(match.guncellenme_tarihi)}</span>
						</div>
						<div className="detail-item">
							<span className="label">Entry Fee</span>
							<span className="value">₺{match.giris_ucreti}</span>
						</div>
						<div className="detail-item">
							<span className="label">Total Pot</span>
							<span className="value">₺{match.giris_ucreti * 2}</span>
						</div>
					</div>
				</section>

				{/* Actions Section */}
				{isCreator && match.durum !== 'tamamlandı' && (
					<section className="actions-section">
						<h2>Match Actions</h2>

						{/* Start Match */}
						{match.durum === 'beklemede' && (
							<div className="action-group">
								<h3>Start the match</h3>
								<p className="description">
									Both players have joined. Click to start the match.
								</p>
								<button
									onClick={handleStartMatch}
									disabled={actionLoading || !match.katilan_id}
									className="btn-primary btn-large"
								>
									{actionLoading ? 'Starting...' : '🎮 Start Match'}
								</button>
							</div>
						)}

						{/* Complete Match */}
						{match.durum === 'oynanıyor' && (
							<div className="action-group">
								<h3>Complete match and distribute rewards</h3>
								<p className="description">
									Select the winner to distribute the prize pool.
								</p>

								<div className="winner-selector">
									<label className="option">
										<input
											type="radio"
											name="winner"
											value="creator"
											checked={winner === 'creator'}
											onChange={(e) => setWinner(e.target.value)}
										/>
										<span>{creatorName} wins (gets ₺{match.giris_ucreti * 2})</span>
									</label>

									<label className="option">
										<input
											type="radio"
											name="winner"
											value="participant"
											checked={winner === 'participant'}
											onChange={(e) => setWinner(e.target.value)}
										/>
										<span>{participantName} wins (gets ₺{match.giris_ucreti * 2})</span>
									</label>
								</div>

								<button
									onClick={handleCompleteMatch}
									disabled={actionLoading || !winner}
									className="btn-success btn-large"
								>
									{actionLoading ? 'Processing...' : '✓ Complete Match & Distribute'}
								</button>
							</div>
						)}
					</section>
				)}
			</div>
		</div>
	);
};

export default Match;
