from pathlib import Path
import subprocess
import tempfile

# Execute the production recorder against fake audio hardware, without microphone access.
root = Path(__file__).resolve().parents[2]
source='\n'.join((root / f'PaDlroliroBox/PaDlroliroBox/{name}.swift').read_text() for name in ('PaliroSereneCadence', 'PaliroVelvetEcho'))
source='\n'.join(line for line in source.splitlines() if not line.startswith('import ')).replace('@objc(PaliroVelvetEcho)\n','')
for selector in ('start', 'pause', 'resume', 'stop', 'cancel', 'discard'):
    source=source.replace(f'@objc({selector}:) ', '')
source=source.replace('Bundle.main.object(forInfoDictionaryKey: "NSMicrophoneUsageDescription") as? String','Optional("Microphone test")')
stubs=r'''
import Foundation
let AVFormatIDKey="format", AVSampleRateKey="rate", AVNumberOfChannelsKey="channels", AVEncoderAudioQualityKey="quality", kAudioFormatMPEG4AAC=1
enum AVAudioQuality:Int { case high=1 }
protocol PaliroMeadowHarmony {}
class PaliroSilverWillow { func duskAffinityCanvas() {} }
class PaliroAmberRipple {
 let done=DispatchSemaphore(value:0)
 var error:String?; var value:[String:Any]=[:]
 func dawnThoughtCanvas(_ result:[String:Any]=[:]) { value=result;done.signal() }
 func silkenWonderCanvas(_ message:String,_ code:String?=nil,_ error:Error?=nil){ self.error=code ?? message;done.signal() }
 func dawnReflectionCanvas(_ key:String)->String? { nil }
 func wait(){ precondition(done.wait(timeout:.now()+3) == .success,"call did not finish") }
}
struct Port { var channels:[Int]?=[1] }
struct Route { var inputs=[Port()] }
class AVCaptureDevice { enum Media {case audio}; static func `default`(for type:Media)->AVCaptureDevice? { AVCaptureDevice() } }
class AVAudioSession {
 enum Category {case playAndRecord}; enum Mode {case `default`}; enum Permission {case granted,undetermined,denied}
 struct Options:OptionSet {let rawValue:Int;static let defaultToSpeaker=Self(rawValue:1),allowBluetoothHFP=Self(rawValue:2),notifyOthersOnDeactivation=Self(rawValue:4)}
 static let instance=AVAudioSession();static func sharedInstance()->AVAudioSession {instance}
 var recordPermission=Permission.granted, isInputAvailable=true, inputNumberOfChannels=1, sampleRate=48000.0
 var availableInputs:[Port]?=[Port()],currentRoute=Route()
 var gate:DispatchSemaphore?;let entered=DispatchSemaphore(value:0)
 func setCategory(_ category:Category,mode:Mode,options:Options)throws {precondition(!Thread.isMainThread)}
 func setActive(_ active:Bool,options:Options=[])throws {precondition(!Thread.isMainThread);if active,let gate {entered.signal();gate.wait()}}
 func requestRecordPermission(_ reply:@escaping(Bool)->Void){reply(true)}
}
class AVAudioRecorder {
 static var starts=0
 var isRecording=false,currentTime=2.0
 init(url:URL,settings:[String:Any])throws { precondition(!Thread.isMainThread) }
 func prepareToRecord()->Bool {precondition(!Thread.isMainThread);return true}
 func record()->Bool {precondition(!Thread.isMainThread);Self.starts += 1;isRecording=true;return true}
 func stop(){precondition(!Thread.isMainThread);isRecording=false}
 func pause(){precondition(!Thread.isMainThread);isRecording=false}
}
'''
tests=r'''
let audio=AVAudioSession.instance
let plugin=PaliroVelvetEcho()
audio.availableInputs=[]
let missing=PaliroAmberRipple();plugin.mindfulWonderSignalPath(missing);missing.wait();precondition(missing.error=="AUDIO_INPUT_UNAVAILABLE");precondition(AVAudioRecorder.starts==0)
print("PASS missing device does not create recorder")
audio.availableInputs=[Port()];audio.inputNumberOfChannels=0
let zero=PaliroAmberRipple();plugin.mindfulWonderSignalPath(zero);zero.wait();precondition(zero.error=="AUDIO_INPUT_UNAVAILABLE");precondition(AVAudioRecorder.starts==0)
print("PASS zero-channel route rejected before encoder")
audio.inputNumberOfChannels=1;audio.gate=DispatchSemaphore(value:0)
let starting=PaliroAmberRipple();plugin.mindfulWonderSignalPath(starting);precondition(audio.entered.wait(timeout:.now()+2) == .success)
let cancelling=PaliroAmberRipple();plugin.warmWonderSignalPath(cancelling)
precondition(cancelling.done.wait(timeout:.now()) == .success,"cancel blocked behind audio hardware")
audio.gate!.signal();starting.wait();precondition(AVAudioRecorder.starts==0)
audio.gate=nil
print("PASS blocked hardware leaves main thread free; cancel prevents late recording")
let retry=PaliroAmberRipple();plugin.mindfulWonderSignalPath(retry);retry.wait();precondition(retry.error==nil)
let pause=PaliroAmberRipple();plugin.subtleExpressionBeacon(pause);pause.wait();precondition(pause.error==nil)
let resume=PaliroAmberRipple();plugin.warmThoughtCanvas(resume);resume.wait();precondition(resume.error==nil)
let stop=PaliroAmberRipple();plugin.warmAffinityBridge(stop);stop.wait();precondition(stop.error==nil);precondition(stop.value["durationSeconds"] as? Double == 2)
print("PASS retry, pause, resume, stop on worker queue")
'''
with tempfile.TemporaryDirectory(prefix='paliro-native-voice-') as directory:
    harness = Path(directory) / 'paliro-native-voice-check.swift'
    executable = Path(directory) / 'paliro-native-voice-check'
    harness.write_text(stubs + source + tests)
    subprocess.run(['swiftc', '-swift-version', '5', str(harness), '-o', str(executable)], check=True)
    subprocess.run([str(executable)], check=True)
