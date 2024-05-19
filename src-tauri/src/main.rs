// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rustube::{
    video_info::player_response::streaming_data::{AudioQuality, QualityLabel},
    Id, VideoFetcher,
};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct AudioDetail {
    audio_quality: String,
}
#[derive(Serialize, Deserialize, Debug)]
struct VideoDetail {
    video_quality: String,
}
#[derive(Serialize, Deserialize, Debug)]
struct Streams {
    audio: Vec<AudioDetail>,
    video: Vec<VideoDetail>,
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_audio_and_video_detail,
            download_video
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn download_video(url: String, video_option: String, audio_option: String, path: String) {
    let url_static = Box::leak(url.into_boxed_str());
    let id = Id::from_raw(url_static).unwrap();

    let descrambler = VideoFetcher::from_id(id).unwrap().fetch().await.unwrap();
    let video = descrambler.descramble().unwrap();

    let stream = video.streams();

    let selected_video_quality = match video_option.as_str() {
        "144p" => QualityLabel::P144,
        "144p HDR" => QualityLabel::P144HDR,
        "144p 60Hz HDR" => QualityLabel::P144Hz60HDR,
        "240p" => QualityLabel::P240,
        "240p HDR" => QualityLabel::P240HDR,
        "240p 60Hz HDR" => QualityLabel::P240Hz60HDR,
        "360p" => QualityLabel::P360,
        "360p HDR" => QualityLabel::P360HDR,
        "360p 60Hz" => QualityLabel::P360Hz60,
        "360p 60Hz HDR" => QualityLabel::P360Hz60HDR,
        "480p" => QualityLabel::P480,
        "480p HDR" => QualityLabel::P480HDR,
        "480p 60Hz" => QualityLabel::P480Hz60,
        "480p 60Hz HDR" => QualityLabel::P480Hz60HDR,
        "720p" => QualityLabel::P720,
        "720p 50Hz" => QualityLabel::P720Hz50,
        "720p 60Hz" => QualityLabel::P720Hz60,
        "720p 60Hz HDR" => QualityLabel::P720Hz60HDR,
        "1080p" => QualityLabel::P1080,
        "1080p 50Hz" => QualityLabel::P1080Hz50,
        "1080p 60Hz" => QualityLabel::P1080Hz60,
        "1080p 60Hz HDR" => QualityLabel::P1080Hz60HDR,
        "1440p" => QualityLabel::P1440,
        "1440p 60Hz" => QualityLabel::P1440Hz60,
        "1440p 60Hz HDR" => QualityLabel::P1440Hz60HDR,
        "2160p" => QualityLabel::P2160,
        "2160p 60Hz" => QualityLabel::P2160Hz60,
        "2160p 60Hz HDR" => QualityLabel::P2160Hz60HDR,
        "4320p" => QualityLabel::P4320,
        "4320p 60Hz" => QualityLabel::P4320Hz60,
        _ => QualityLabel::P144,
    };
    let video = stream
        .iter()
        .find(|&x| {
            x.mime.to_string() == "video/mp4"
                && !x.includes_audio_track
                && x.quality_label.unwrap() == selected_video_quality
        })
        .unwrap();

    let selected_audio_quality = match audio_option.as_str() {
        "Low" => AudioQuality::Low,
        "Medium" => AudioQuality::Medium,
        "High" => AudioQuality::High,
        _ => AudioQuality::Low,
    };

    let audio = stream
        .iter()
        .find(|&x| {
            x.mime.to_string().contains("audio/mp4")
                && !x.includes_video_track
                && x.audio_quality.unwrap() == selected_audio_quality
        })
        .unwrap();

    video
        .download_to(std::path::Path::new("video.mp4"))
        .await
        .unwrap();

    audio
        .download_to(std::path::Path::new("audio.mp4"))
        .await
        .unwrap();

    let args = [
        "-i",
        "video.mp4",
        "-i",
        "audio.mp4",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "output.mp4",
    ]
    .iter()
    .map(|x| x.to_string())
    .collect::<Vec<String>>();

    ffpb::ffmpeg(&args).unwrap();

    std::fs::remove_file("video.mp4").unwrap();
    std::fs::remove_file("audio.mp4").unwrap();

    let saving_path = path + "/" + &video.video_details.title.to_string() + ".mp4";
    std::fs::rename("output.mp4", saving_path).unwrap();
}

#[tauri::command]
async fn get_audio_and_video_detail(url: String) -> String {
    let url_static = Box::leak(url.into_boxed_str());
    let id = Id::from_raw(url_static).unwrap();

    let descrambler = VideoFetcher::from_id(id).unwrap().fetch().await.unwrap();
    let video = descrambler.descramble().unwrap();
    let stream = video.streams();

    let mut streams = Streams {
        audio: Vec::new(),
        video: Vec::new(),
    };

    for s in stream.iter() {
        if s.mime.to_string() == "video/mp4" && !s.includes_audio_track {
            let video_detail = VideoDetail {
                video_quality: match s.quality_label.unwrap() {
                    QualityLabel::P144 => String::from("144p"),
                    QualityLabel::P144HDR => String::from("144p HDR"),
                    QualityLabel::P144Hz60HDR => String::from("144p 60Hz HDR"),
                    QualityLabel::P240 => String::from("240p"),
                    QualityLabel::P240HDR => String::from("240p HDR"),
                    QualityLabel::P240Hz60HDR => String::from("240p 60Hz HDR"),
                    QualityLabel::P360 => String::from("360p"),
                    QualityLabel::P360HDR => String::from("360p HDR"),
                    QualityLabel::P360Hz60 => String::from("360p 60Hz"),
                    QualityLabel::P360Hz60HDR => String::from("360p 60Hz HDR"),
                    QualityLabel::P480 => String::from("480p"),
                    QualityLabel::P480HDR => String::from("480p HDR"),
                    QualityLabel::P480Hz60 => String::from("480p 60Hz"),
                    QualityLabel::P480Hz60HDR => String::from("480p 60Hz HDR"),
                    QualityLabel::P720 => String::from("720p"),
                    QualityLabel::P720Hz50 => String::from("720p 50Hz"),
                    QualityLabel::P720Hz60 => String::from("720p 60Hz"),
                    QualityLabel::P720Hz60HDR => String::from("720p 60Hz HDR"),
                    QualityLabel::P1080 => String::from("1080p"),
                    QualityLabel::P1080Hz50 => String::from("1080p 50Hz"),
                    QualityLabel::P1080Hz60 => String::from("1080p 60Hz"),
                    QualityLabel::P1080Hz60HDR => String::from("1080p 60Hz HDR"),
                    QualityLabel::P1440 => String::from("1440p"),
                    QualityLabel::P1440Hz60 => String::from("1440p 60Hz"),
                    QualityLabel::P1440Hz60HDR => String::from("1440p 60Hz HDR"),
                    QualityLabel::P2160 => String::from("2160p"),
                    QualityLabel::P2160Hz60 => String::from("2160p 60Hz"),
                    QualityLabel::P2160Hz60HDR => String::from("2160p 60Hz HDR"),
                    QualityLabel::P4320 => String::from("4320p"),
                    QualityLabel::P4320Hz60 => String::from("4320p 60Hz"),
                    QualityLabel::P4320Hz60HDR => String::from("4320p 60Hz HDR"),
                    _ => String::from(""),
                },
            };
            streams.video.push(video_detail);
        }
    }
    for s in stream.iter() {
        if s.mime.to_string().contains("audio/mp4") && !s.includes_video_track {
            let audio_detail = AudioDetail {
                audio_quality: match s.audio_quality.unwrap() {
                    AudioQuality::Low => String::from("Low"),
                    AudioQuality::Medium => String::from("Medium"),
                    AudioQuality::High => String::from("High"),
                },
            };

            streams.audio.push(audio_detail);
        }
    }

    let json = serde_json::to_string(&streams).unwrap();

    return json;
}
