use std::fs;

fn reject_json_plugin_config() {
    let raw = fs::read_to_string("tauri.conf.json").expect("read tauri.conf.json");
    let value: serde_json::Value =
        serde_json::from_str(&raw).expect("parse tauri.conf.json as JSON");
    if value.get("plugins").is_none() {
        return;
    }
    panic!(
        "\n\nRemove the `plugins` object from desktop/src-tauri/tauri.conf.json.\n\
         Tauri 2 rejects empty objects like `\"notification\": {{}}` with:\n\
         PluginInitialization(\"notification\", \"invalid type: map, expected unit\").\n\
         Register plugins in src/lib.rs instead, then rerun `npm run tauri dev`.\n"
    );
}

fn main() {
    reject_json_plugin_config();
    tauri_build::build()
}
