import { Injectable } from '@angular/core';

/**
 * RtcService handles WebRTC peer connections and local media stream setup.
 * It provides functionality to initialize the user's camera/microphone,
 * manage multiple peer connections, and handle offer/answer negotiation.
 */
@Injectable({ providedIn: 'root' })
export class RtcService {
	/**
	 * Map of peer connections, keyed by peer ID.
	 */
	private peers = new Map<string, RTCPeerConnection>();

	/**
	 * Local media stream from user's camera and microphone.
	 */
	private localStream: MediaStream | null = null;

	/**
	 * Initializes the local media stream (audio/video).
	 * Requests permissions and stores the stream internally.
	 */
	async initLocalStream(): Promise<MediaStream> {
		if (!this.localStream) {
			this.localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
		}

		return this.localStream;
	}

	/**
	 * Creates a new RTCPeerConnection for the given ID and attaches local tracks.
	 */
	async createPeer(id: string): Promise<RTCPeerConnection> {
		const peer = new RTCPeerConnection();

		this.localStream
			?.getTracks()
			.forEach((track) => peer.addTrack(track, this.localStream!));

		this.peers.set(id, peer);

		return peer;
	}

	/**
	 * Retrieves an existing peer connection by ID.
	 */
	getPeer(id: string): RTCPeerConnection | undefined {
		return this.peers.get(id);
	}

	/**
	 * Creates an SDP offer for the specified peer and sets it as the local description.
	 */
	async createOffer(id: string): Promise<RTCSessionDescriptionInit> {
		const peer = this.peers.get(id);

		if (!peer) throw new Error('Peer not found');

		const offer = await peer.createOffer();

		await peer.setLocalDescription(offer);

		return offer;
	}

	/**
	 * Accepts an SDP offer, creates an answer, and sets it as the local description.
	 */
	async createAnswer(
		id: string,
		offer: RTCSessionDescriptionInit,
	): Promise<RTCSessionDescriptionInit> {
		const peer = this.peers.get(id);

		if (!peer) throw new Error('Peer not found');

		await peer.setRemoteDescription(new RTCSessionDescription(offer));

		const answer = await peer.createAnswer();

		await peer.setLocalDescription(answer);

		return answer;
	}

	/**
	 * Sets the remote description with an SDP answer for the given peer.
	 */
	async setRemoteAnswer(id: string, answer: RTCSessionDescriptionInit) {
		const peer = this.peers.get(id);

		if (!peer) throw new Error('Peer not found');

		await peer.setRemoteDescription(new RTCSessionDescription(answer));
	}

	/**
	 * Adds an ICE candidate to the specified peer connection.
	 */
	addIceCandidate(id: string, candidate: RTCIceCandidateInit) {
		const peer = this.peers.get(id);

		if (peer) peer.addIceCandidate(new RTCIceCandidate(candidate));
	}

	/**
	 * Returns the initialized local media stream.
	 */
	getLocalStream(): MediaStream | null {
		return this.localStream;
	}

	/**
	 * Closes a specific peer connection and removes it from the map.
	 */
	closePeer(id: string) {
		const peer = this.peers.get(id);

		if (peer) {
			peer.close();

			this.peers.delete(id);
		}
	}

	/**
	 * Closes all peer connections and stops the local media stream.
	 */
	closeAll() {
		this.peers.forEach((peer) => peer.close());

		this.peers.clear();

		this.localStream?.getTracks().forEach((track) => track.stop());

		this.localStream = null;
	}
}
