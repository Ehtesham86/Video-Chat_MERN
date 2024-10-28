class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });

      // Handle track event to receive remote streams
      this.peer.ontrack = (event) => {
        const remoteStream = event.streams[0];
        // Assuming you have a method to set the remote stream in your component
        this.onRemoteStream(remoteStream);
      };
    }
  }

  onRemoteStream(remoteStream) {
    // This function should be implemented to handle the remote stream
    // E.g., pass it to your component's state or a callback
    console.log("Remote stream received", remoteStream);
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  addTrack(track, stream) {
    if (this.peer) {
      this.peer.addTrack(track, stream);
    }
  }
}

export default new PeerService();
