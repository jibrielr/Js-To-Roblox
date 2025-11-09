local ServerScriptService = game:GetService("ServerScriptService")
local HttpService = game:GetService("HttpService")

local Services = ServerScriptService.Services

local WebService = require(Services.WebService)
local ModerationService = require(Services.ModerationService)

local Types = {
	ban = ModerationService.PermBan,
	kick = ModerationService.Kick,
	tban = ModerationService.TempBan,
	unban = ModerationService.Unban
}

local function MarkRequestTaken(RequestID)
	local Data = HttpService:JSONEncode({ id = RequestID })
	local Success, Result = pcall(function()
		local Response = HttpService:PostAsync("https://bot.jayzware.xyz/requests/taken", Data, Enum.HttpContentType.ApplicationJson)
		return Response
	end)

	if not Success then
		warn("Failed to mark request taken:", Result)
		return false
	end

	local Decoded = HttpService:JSONDecode(Result)
	if Decoded and Decoded.success then
		return true
	end
	return false
end

while task.wait() do
	local Success, Response = pcall(function()
		return HttpService:GetAsync("https://bot.jayzware.xyz/requests")
	end)
	if Success then
		local RequestData = HttpService:JSONDecode(Response)
		if RequestData then
			for Username, Data in pairs(RequestData) do
				if Data and Data.id then
					local taken = MarkRequestTaken(Data.id)
					if taken then
						if Data.type and Types[Data.type] then
							Types[Data.type](Data.moderator, Username, Data.reason)
							Data.guild = WebService.GetJobID()
							Data.username = Username
						end			
					else
						warn("Request " .. Data.id .. " already taken, skipping")
					end
				end
			end
		else
			warn("Failed to decode JSON response.")
		end
	else
		warn("Failed to get requests:", Response)
	end
end
